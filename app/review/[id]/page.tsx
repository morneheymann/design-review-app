"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Star, MessageSquare, Loader2, AlertCircle, Eye, Sparkles, GitCompare, Palette, Users, BarChart3 } from "lucide-react"
import { useAuth } from '@/lib/auth'
import { DesignPair } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import AIAnalysisComponent from '@/components/AIAnalysis'
import { AIAnalysis } from '@/lib/gemini'

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [designPair, setDesignPair] = useState<DesignPair | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)

  const pairId = params.id as string

  useEffect(() => {
    if (!authLoading && pairId && user) {
      loadDesignPair()
      checkExistingReview()
    }
  }, [authLoading, pairId, user])

  const loadDesignPair = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('design_pairs')
        .select(`
          *,
          design_a:designs!design_a_id(*),
          design_b:designs!design_b_id(*),
          ratings(*)
        `)
        .eq('id', pairId)
        .single()

      if (error) {
        console.error('Error loading design pair:', error)
        throw error
      }

      setDesignPair(data)
    } catch (error) {
      console.error('Error loading design pair:', error)
      alert('Failed to load design comparison')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingReview = async () => {
    if (!user || !pairId) return

    try {
      // Check if user has already reviewed this design pair
      const { data, error } = await supabase
        .rpc('has_user_reviewed_design_pair', {
          user_uuid: user.id,
          design_pair_uuid: pairId
        })

      if (error) {
        console.error('Error checking existing review:', error)
        return
      }

      if (data) {
        setHasAlreadyReviewed(true)
        
        // Get the existing review details
        const { data: reviewData, error: reviewError } = await supabase
          .rpc('get_user_design_pair_review', {
            user_uuid: user.id,
            design_pair_uuid: pairId
          })

        if (!reviewError && reviewData && reviewData.length > 0) {
          setExistingReview(reviewData[0])
        }
      }
    } catch (error) {
      console.error('Error checking existing review:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedDesign || !user) return

    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('ratings')
        .insert({
          tester_id: user.id,
          design_pair_id: pairId,
          chosen_design_id: selectedDesign,
          feedback: feedback.trim() || null
        })

      if (error) {
        console.error('Error submitting rating:', error)
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
          alert('You have already reviewed this design pair. You can only review each design pair once.')
          setHasAlreadyReviewed(true)
          checkExistingReview()
          return
        }
        throw error
      }

      setSubmitted(true)
      
      // Redirect back to designs page after 2 seconds
      setTimeout(() => {
        router.push('/designs')
      }, 2000)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDesignSelect = (designId: string) => {
    setSelectedDesign(designId)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading design comparison...</h2>
        </div>
      </div>
    )
  }

  if (!designPair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Design comparison not found</h2>
          <Button 
            onClick={() => router.push('/designs')} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-6 py-3 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Designs
          </Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Review <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Submitted!</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for your valuable feedback. Your review helps improve design quality for everyone.
          </p>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold shadow-sm border border-white/50">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Redirecting back to designs...
          </div>
        </div>
      </div>
    )
  }

  // Show already reviewed state
  if (hasAlreadyReviewed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/designs')} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Designs
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold mb-4 shadow-sm border border-white/50">
              <CheckCircle className="h-4 w-4 mr-2" />
              Already Reviewed
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              You've Already <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Reviewed</span> This Design
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Thank you for your previous feedback. You can view other design comparisons or check your review below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Design Comparison */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <GitCompare className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{designPair.title}</CardTitle>
                </div>
                {designPair.description && (
                  <CardDescription className="text-gray-600">{designPair.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                    {designPair.design_a?.image_url ? (
                      <img 
                        src={designPair.design_a.image_url} 
                        alt="Design A"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                          <Palette className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-sm font-semibold text-white">Design A</span>
                    </div>
                  </div>
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                    {designPair.design_b?.image_url ? (
                      <img 
                        src={designPair.design_b.image_url} 
                        alt="Design B"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                          <Palette className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-sm font-semibold text-white">Design B</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Review */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Your Review</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {existingReview && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-700">You chose:</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium">
                        {existingReview.chosen_design_id === designPair.design_a?.id ? 'Design A' : 'Design B'}
                      </span>
                    </div>
                    {existingReview.feedback && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700 block mb-2">Your feedback:</span>
                        <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm">
                          {existingReview.feedback}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Reviewed on {new Date(existingReview.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => router.push('/designs')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-4 rounded-xl"
            >
              <Eye className="h-5 w-5 mr-3" />
              Browse More Designs
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
              <Button variant="ghost" size="sm" onClick={() => router.push('/designs')} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Designs
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
            <Star className="h-4 w-4 mr-2 animate-pulse" />
            Design Review
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Review <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Design Comparison</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Compare the two designs below and provide your feedback. Your input helps improve design quality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Comparison */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <GitCompare className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{designPair.title}</CardTitle>
              </div>
              {designPair.description && (
                <CardDescription className="text-gray-600">{designPair.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                  className={`relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedDesign === designPair.design_a?.id 
                      ? 'ring-4 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleDesignSelect(designPair.design_a?.id || '')}
                >
                  {designPair.design_a?.image_url ? (
                    <img 
                      src={designPair.design_a.image_url} 
                      alt="Design A"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                        <Palette className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <span className="text-sm font-semibold text-white">Design A</span>
                  </div>
                  {selectedDesign === designPair.design_a?.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div 
                  className={`relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedDesign === designPair.design_b?.id 
                      ? 'ring-4 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleDesignSelect(designPair.design_b?.id || '')}
                >
                  {designPair.design_b?.image_url ? (
                    <img 
                      src={designPair.design_b.image_url} 
                      alt="Design B"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                        <Palette className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <span className="text-sm font-semibold text-white">Design B</span>
                  </div>
                  {selectedDesign === designPair.design_b?.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Click on the design you prefer
                </p>
                {selectedDesign && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold shadow-sm border border-white/50">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {selectedDesign === designPair.design_a?.id ? 'Design A' : 'Design B'} selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Your Feedback</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                Share your thoughts on the design comparison (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="feedback" className="text-sm font-semibold text-gray-700">
                  Additional Comments
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="What do you think about these designs? What works well? What could be improved?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={!selectedDesign || submitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Submit Review
                  </>
                )}
              </Button>

              {!selectedDesign && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">Please select a design before submitting</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        {designPair && (
          <div className="mt-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">AI Analysis</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Get AI-powered insights on this design comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAnalysisComponent 
                  designPair={{
                    id: designPair.id,
                    title: designPair.title,
                    description: designPair.description,
                    design_a: designPair.design_a,
                    design_b: designPair.design_b
                  }}
                  onAnalysisComplete={setAiAnalysis}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
} 