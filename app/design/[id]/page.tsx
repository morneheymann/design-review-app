"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDesignPairById } from '@/lib/designs'
import { getDesignPairVotingStats } from '@/lib/reviews'

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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading design...</p>
              <p className="text-sm text-gray-500 mt-2">ID: {designPairId}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">Design ID: {designPairId}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!designPair) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Design Not Found</h2>
            <p className="text-yellow-600">The requested design could not be found.</p>
            <p className="text-sm text-yellow-500 mt-2">Design ID: {designPairId}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Comparison</h1>
          <p className="text-gray-600">Compare the two design variations side by side</p>
        </div>

        {/* Voting Statistics */}
        {votingStats && votingStats.totalVotes > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Variation A Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Variation A</span>
                  <span className="text-sm text-gray-500">{votingStats.designAVotes} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votingStats.designAPercentage}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-blue-600">{votingStats.designAPercentage}%</span>
                </div>
              </div>

              {/* Variation B Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Variation B</span>
                  <span className="text-sm text-gray-500">{votingStats.designBVotes} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${votingStats.designBPercentage}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-green-600">{votingStats.designBPercentage}%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Total votes: <span className="font-semibold">{votingStats.totalVotes}</span>
              </p>
            </div>
          </div>
        )}

        {/* Design Variations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Variation A */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {designPair.design_a?.title || 'Variation A'}
                </h2>
                {votingStats && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{votingStats.designAVotes} votes</span>
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
              {designPair.design_a?.description && (
                <p className="text-gray-600 mb-4 text-sm">
                  {designPair.design_a.description}
                </p>
              )}
            </div>
            <div className="relative">
              {designPair.design_a?.image_url ? (
                <img
                  src={designPair.design_a.image_url}
                  alt={designPair.design_a?.title || 'Variation A'}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Variation B */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {designPair.design_b?.title || 'Variation B'}
                </h2>
                {votingStats && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{votingStats.designBVotes} votes</span>
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </div>
              {designPair.design_b?.description && (
                <p className="text-gray-600 mb-4 text-sm">
                  {designPair.design_b.description}
                </p>
              )}
            </div>
            <div className="relative">
              {designPair.design_b?.image_url ? (
                <img
                  src={designPair.design_b.image_url}
                  alt={designPair.design_b?.title || 'Variation B'}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Design Pair ID:</span>
              <span className="ml-2 text-gray-600 font-mono">{designPair.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {designPair.created_at ? new Date(designPair.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            {votingStats && (
              <div>
                <span className="font-medium text-gray-700">Total Votes:</span>
                <span className="ml-2 text-gray-600">{votingStats.totalVotes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 