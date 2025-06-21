"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDesignPairById } from '@/lib/designs'
import { getDesignPairVotingStats } from '@/lib/reviews'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, BarChart3, Users, Calendar, GitCompare, Sparkles, Palette, TrendingUp, Activity, Star, Target } from "lucide-react"

export default function DesignPage() {
  const params = useParams()
  const router = useRouter()
  const designPairId = params.id as string

  const [designPair, setDesignPair] = useState<any>(null)
  const [votingStats, setVotingStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!designPairId) {
      setError('No design ID provided')
      setLoading(false)
      return
    }

    console.log('DesignPage: Component rendering with designPairId:', designPairId)
    
    const loadDesign = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('DesignPage: Starting to load design pair and voting stats...')
        
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
        
        const loadPromise = Promise.all([
          getDesignPairById(designPairId),
          getDesignPairVotingStats(designPairId)
        ])
        
        const [result, stats] = await Promise.race([loadPromise, timeoutPromise]) as [any, any]
        
        console.log('DesignPage: Successfully loaded design pair:', result)
        console.log('DesignPage: Successfully loaded voting stats:', stats)
        
        setDesignPair(result)
        setVotingStats(stats)
      } catch (err) {
        console.error('DesignPage: Error loading design:', err)
        setError(err instanceof Error ? err.message : 'Failed to load design')
      } finally {
        setLoading(false)
      }
    }
    
    loadDesign()
  }, [designPairId])

  console.log('DesignPage: Render state:', {
    loading,
    error,
    designPair: designPair ? 'loaded' : null,
    votingStats: votingStats ? 'loaded' : null,
    designPairId
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading design comparison...</h2>
          <p className="text-sm text-gray-500 mt-2">ID: {designPairId}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-red-200 to-red-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Design</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <p className="text-sm text-gray-500 mb-8">Design ID: {designPairId}</p>
            <Button 
              onClick={() => router.back()} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!designPair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-10 w-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Not Found</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">The requested design comparison could not be found.</p>
            <p className="text-sm text-gray-500 mb-8">Design ID: {designPairId}</p>
            <Button 
              onClick={() => router.back()} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-6 py-3 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
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
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-4 shadow-sm border border-white/50">
            <Eye className="h-4 w-4 mr-2" />
            Design Comparison
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {designPair.title || 'Design Comparison'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {designPair.description || 'Compare the two design variations side by side and see the voting results.'}
          </p>
        </div>

        {/* Voting Statistics */}
        {votingStats && votingStats.totalVotes > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30 mb-12">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Voting Results</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                See how the community voted on these design variations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Variation A Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 text-lg">Design A</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{votingStats.designAVotes} votes</span>
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${votingStats.designAPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {votingStats.designAPercentage}%
                    </span>
                  </div>
                </div>

                {/* Variation B Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 text-lg">Design B</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{votingStats.designBVotes} votes</span>
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${votingStats.designBPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      {votingStats.designBPercentage}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <p className="text-lg text-gray-700">
                    Total votes: <span className="font-bold text-gray-900">{votingStats.totalVotes}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Design Variations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Design A */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30 group">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {designPair.design_a?.title || 'Design A'}
                  </CardTitle>
                </div>
                {votingStats && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full">
                    <span className="text-sm font-semibold text-blue-800">{votingStats.designAVotes} votes</span>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
              {designPair.design_a?.description && (
                <CardDescription className="text-gray-600">
                  {designPair.design_a.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-200">
                {designPair.design_a?.image_url ? (
                  <img
                    src={designPair.design_a.image_url}
                    alt={designPair.design_a?.title || 'Design A'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                      <Palette className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-sm font-semibold text-white">Design A</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design B */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30 group">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {designPair.design_b?.title || 'Design B'}
                  </CardTitle>
                </div>
                {votingStats && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 rounded-full">
                    <span className="text-sm font-semibold text-green-800">{votingStats.designBVotes} votes</span>
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </div>
              {designPair.design_b?.description && (
                <CardDescription className="text-gray-600">
                  {designPair.design_b.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-200">
                {designPair.design_b?.image_url ? (
                  <img
                    src={designPair.design_b.image_url}
                    alt={designPair.design_b?.title || 'Design B'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                      <Palette className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-sm font-semibold text-white">Design B</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Design Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <GitCompare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Design Pair ID</p>
                  <p className="text-sm text-gray-600 font-mono">{designPair.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">
                    {designPair.created_at ? new Date(designPair.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              {votingStats && (
                <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Total Votes</p>
                    <p className="text-sm text-gray-600">{votingStats.totalVotes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 