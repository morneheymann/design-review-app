"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Star, Eye, Search, Filter, GitCompare, Trash2, Sparkles, Upload, Palette, BarChart3 } from "lucide-react"
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

      console.log('Successfully deleted design pair and related data')
      
      // Remove from local state
      setDesignPairs(prev => prev.filter(dp => dp.id !== pairId))
      
    } catch (error) {
      console.error('Error deleting design pair:', error)
      alert(`Error deleting design pair: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading designs...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DesignReview
                </h1>
              </div>
            </div>
            <Button 
              asChild 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-6 py-2.5 rounded-xl"
            >
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Design
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-4 shadow-sm border border-white/50">
            <Palette className="h-4 w-4 mr-2" />
            Design Gallery
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse & Review <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Designs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Explore design comparisons, provide feedback, and discover creative work from the community.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={`rounded-xl px-6 h-12 ${filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                className={`rounded-xl px-6 h-12 ${filterStatus === 'pending' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'reviewed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('reviewed')}
                className={`rounded-xl px-6 h-12 ${filterStatus === 'reviewed' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                Reviewed
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredDesignPairs.length}</span> design{filteredDesignPairs.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Design Pairs Grid */}
        {filteredDesignPairs.length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <GitCompare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No designs found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? `No designs match your search for "${searchTerm}". Try adjusting your search terms.`
                  : 'No design comparisons available yet. Be the first to upload a design!'
                }
              </p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-4 rounded-xl"
              >
                <Link href="/upload">
                  <Upload className="mr-3 h-5 w-5" />
                  Upload Your First Design
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesignPairs.map((pair) => (
              <Card 
                key={pair.id} 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/30 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <GitCompare className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">{pair.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          {formatDate(pair.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    {isDesignOwner(pair) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDesignPair(pair.id)}
                        disabled={deletingId === pair.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {pair.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pair.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {pair.ratings?.length || 0}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">reviews</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pair.ratings && pair.ratings.length > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pair.ratings && pair.ratings.length > 0 ? 'Reviewed' : 'Pending'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleReviewDesignPair(pair.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold rounded-xl"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewDesignPair(pair.id)}
                      className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 rounded-xl"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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