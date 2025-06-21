"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Star, Eye, Search, Filter, GitCompare, Trash2 } from "lucide-react"
import { getDesignPairsForReview, testDesignsAccess } from '@/lib/reviews'
import { useAuth } from '@/lib/auth'
import { DesignPair } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

export default function DesignsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [designPairs, setDesignPairs] = useState<DesignPair[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      loadDesignPairs()
    }
  }, [authLoading])

  const loadDesignPairs = async () => {
    try {
      setLoading(true)
      console.log('Loading design pairs...')
      console.log('Auth loading:', authLoading)
      console.log('User:', user)
      
      // Test access first
      const testResult = await testDesignsAccess()
      console.log('Test result:', testResult)
      
      if (!testResult.success) {
        console.error('Test failed:', testResult.error)
        throw new Error(`Cannot access designs table: ${testResult.error ? (testResult.error as any).message || 'Unknown error' : 'Unknown error'}`)
      }
      
      const designPairsData = await getDesignPairsForReview()
      console.log('Design pairs loaded:', designPairsData)
      console.log('Number of design pairs:', designPairsData.length)
      
      // Log each design pair ID for debugging
      designPairsData.forEach((pair, index) => {
        console.log(`Design pair ${index + 1}:`, { id: pair.id, title: pair.title })
      })
      
      setDesignPairs(designPairsData)
    } catch (error) {
      console.error('Error loading design pairs:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      // Show a more user-friendly error message
      alert(`Error loading design pairs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredDesignPairs = designPairs.filter(pair => {
    const matchesSearch = pair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pair.description && pair.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (filterStatus === 'all') return matchesSearch
    
    const hasRatings = pair.ratings && pair.ratings.length > 0
    if (filterStatus === 'reviewed') return matchesSearch && hasRatings
    if (filterStatus === 'pending') return matchesSearch && !hasRatings
    
    return matchesSearch
  })

  const handleReviewDesignPair = (pairId: string) => {
    router.push(`/review/${pairId}`)
  }

  const handleViewDesignPair = (pairId: string) => {
    console.log('View button clicked for pair ID:', pairId)
    console.log('Navigating to:', `/design/${pairId}`)
    router.push(`/design/${pairId}`)
  }

  const checkDesignPairExists = async (pairId: string) => {
    try {
      const { data, error } = await supabase
        .from('design_pairs')
        .select('id, title')
        .eq('id', pairId)
        .single()
      
      if (error) {
        console.error('Error checking design pair existence:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in checkDesignPairExists:', error)
      return null
    }
  }

  const isDesignOwner = (designPair: DesignPair) => {
    if (!user) return false
    return designPair.design_a?.designer_id === user.id || 
           designPair.design_b?.designer_id === user.id
  }

  const handleDeleteDesignPair = async (pairId: string) => {
    if (!confirm('Are you sure you want to delete this design pair? This action cannot be undone.')) {
      return
    }

    // Check if the design pair exists in the current list
    const designPair = designPairs.find(dp => dp.id === pairId)
    if (!designPair) {
      alert('Design pair not found in the current list. Please refresh the page and try again.')
      return
    }

    // Check if the user is the owner of this design pair
    if (!isDesignOwner(designPair)) {
      alert('You can only delete your own designs.')
      return
    }

    // Double-check if it exists in the database
    const dbDesignPair = await checkDesignPairExists(pairId)
    if (!dbDesignPair) {
      alert('This design pair no longer exists in the database. The page will refresh to show current data.')
      loadDesignPairs() // Refresh the data
      return
    }

    try {
      setDeletingId(pairId)
      
      console.log('Attempting to delete design pair:', pairId)
      console.log('Design pair details:', { id: designPair.id, title: designPair.title })
      console.log('Database confirmation:', dbDesignPair)
      console.log('Available design pairs:', designPairs.map(dp => ({ id: dp.id, title: dp.title })))
      
      // Delete related data in the correct order using direct Supabase calls
      
      // 1. Delete ratings first (foreign key constraint)
      const { error: ratingsError } = await supabase
        .from('ratings')
        .delete()
        .eq('design_pair_id', pairId)

      if (ratingsError) {
        console.error('Error deleting ratings:', ratingsError)
      }

      // 2. Delete AI analysis if exists
      const { error: aiError } = await supabase
        .from('ai_analysis')
        .delete()
        .eq('design_pair_id', pairId)

      if (aiError) {
        console.error('Error deleting AI analysis:', aiError)
      }

      // 3. Delete the design pair
      const { error: deletePairError } = await supabase
        .from('design_pairs')
        .delete()
        .eq('id', pairId)

      if (deletePairError) {
        console.error('Error deleting design pair:', deletePairError)
        throw new Error('Failed to delete design pair')
      }

      // 4. Delete the individual designs if they're not used elsewhere
      if (designPair.design_a?.id) {
        const { error: designAError } = await supabase
          .from('designs')
          .delete()
          .eq('id', designPair.design_a.id)

        if (designAError) {
          console.error('Error deleting design A:', designAError)
        }
      }

      if (designPair.design_b?.id) {
        const { error: designBError } = await supabase
          .from('designs')
          .delete()
          .eq('id', designPair.design_b.id)

        if (designBError) {
          console.error('Error deleting design B:', designBError)
        }
      }

      // Remove the deleted design pair from the state
      setDesignPairs(prev => prev.filter(pair => pair.id !== pairId))
      
      // Show success message
      alert('Design pair deleted successfully')
    } catch (error) {
      console.error('Error deleting design pair:', error)
      alert(`Error deleting design pair: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading design comparisons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-4">
                Design Comparisons for Review
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={loadDesignPairs}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search design comparisons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Comparisons</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Design Pairs Grid */}
        {filteredDesignPairs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <GitCompare className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No design comparisons found' : 'No design comparisons available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back later for new design comparisons to review.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDesignPairs.map((pair) => (
              <Card key={pair.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pair.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {pair.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Design Comparison Preview */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={pair.design_a?.image_url} 
                        alt="Variation A"
                        className="w-full h-full object-cover"
                      />
                      <div className="p-2 bg-blue-500 text-white text-xs text-center">
                        Variation A
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={pair.design_b?.image_url} 
                        alt="Variation B"
                        className="w-full h-full object-cover"
                      />
                      <div className="p-2 bg-green-500 text-white text-xs text-center">
                        Variation B
                      </div>
                    </div>
                  </div>

                  {/* Review Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {pair.ratings ? pair.ratings.length : 0} ratings
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {pair.ratings && pair.ratings.length > 0 ? 'Reviewed' : 'Pending'}
                    </div>
                  </div>

                  {/* Designer Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Designer: {pair.design_a?.designer?.full_name || pair.design_a?.designer?.user_id}</p>
                    <p>Created: {new Date(pair.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link 
                      href={`/design/${pair.id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    <Link 
                      href={`/review/${pair.id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      Compare
                    </Link>
                    {isDesignOwner(pair) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDesignPair(pair.id)}
                        disabled={deletingId === pair.id}
                        className="px-3 h-9 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        title="Delete design pair (only visible to creator)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 