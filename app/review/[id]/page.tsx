"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Star, MessageSquare, Loader2, AlertCircle, Eye } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading design comparison...</p>
        </div>
      </div>
    )
  }

  if (!designPair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Design comparison not found</p>
          <Button onClick={() => router.push('/designs')} className="mt-4">
            Back to Designs
          </Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Review Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thank you for your feedback. Redirecting back to designs...
          </p>
        </div>
      </div>
    )
  }

  // Show already reviewed state
  if (hasAlreadyReviewed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => router.push('/designs')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Designs
                </Button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-4">
                  Design Comparison Review
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Already Reviewed Alert */}
            <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Already Reviewed
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  You have already reviewed this design pair. You can only review each design pair once.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Design Pair Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{designPair.title}</CardTitle>
                <CardDescription>
                  {designPair.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Your Previous Review */}
            {existingReview && (
              <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Your Previous Review
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Submitted on {new Date(existingReview.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-green-800 dark:text-green-200 font-medium">Your Choice:</Label>
                      <p className="text-green-700 dark:text-green-300">
                        {existingReview.chosen_design_id === designPair.design_a?.id ? 'Variation A' : 'Variation B'}
                      </p>
                    </div>
                    {existingReview.feedback && (
                      <div>
                        <Label className="text-green-800 dark:text-green-200 font-medium">Your Feedback:</Label>
                        <p className="text-green-700 dark:text-green-300 mt-1">{existingReview.feedback}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Design Comparison (Read-only) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Design A */}
              <Card className={`transition-all ${
                existingReview?.chosen_design_id === designPair.design_a?.id 
                  ? 'ring-2 ring-green-500 shadow-lg' 
                  : ''
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Variation A</span>
                    {existingReview?.chosen_design_id === designPair.design_a?.id && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={designPair.design_a?.image_url} 
                      alt="Variation A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    {existingReview?.chosen_design_id === designPair.design_a?.id ? 'Your Choice' : 'Variation A'}
                  </Button>
                </CardContent>
              </Card>

              {/* Design B */}
              <Card className={`transition-all ${
                existingReview?.chosen_design_id === designPair.design_b?.id 
                  ? 'ring-2 ring-green-500 shadow-lg' 
                  : ''
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Variation B</span>
                    {existingReview?.chosen_design_id === designPair.design_b?.id && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={designPair.design_b?.image_url} 
                      alt="Variation B"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    {existingReview?.chosen_design_id === designPair.design_b?.id ? 'Your Choice' : 'Variation B'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* View Results Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => router.push(`/design/${pairId}`)}
                size="lg"
                className="px-8"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Results
              </Button>
            </div>
          </div>
        </main>
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
              <Button variant="outline" size="sm" onClick={() => router.push('/designs')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Designs
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-4">
                Design Comparison Review
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Design Pair Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{designPair.title}</CardTitle>
              <CardDescription>
                {designPair.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Design Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Design A */}
            <Card className={`cursor-pointer transition-all ${
              selectedDesign === designPair.design_a?.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Variation A</span>
                  {selectedDesign === designPair.design_a?.id && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={designPair.design_a?.image_url} 
                    alt="Variation A"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  onClick={() => handleDesignSelect(designPair.design_a!.id)}
                  variant={selectedDesign === designPair.design_a?.id ? "default" : "outline"}
                  className="w-full"
                >
                  {selectedDesign === designPair.design_a?.id ? 'Selected' : 'Select This Design'}
                </Button>
              </CardContent>
            </Card>

            {/* Design B */}
            <Card className={`cursor-pointer transition-all ${
              selectedDesign === designPair.design_b?.id 
                ? 'ring-2 ring-green-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Variation B</span>
                  {selectedDesign === designPair.design_b?.id && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={designPair.design_b?.image_url} 
                    alt="Variation B"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  onClick={() => handleDesignSelect(designPair.design_b!.id)}
                  variant={selectedDesign === designPair.design_b?.id ? "default" : "outline"}
                  className="w-full"
                >
                  {selectedDesign === designPair.design_b?.id ? 'Selected' : 'Select This Design'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis */}
          <div className="mb-8">
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
              <p className="text-yellow-800">Debug: AI Analysis section should appear below</p>
            </div>
            <AIAnalysisComponent 
              designPair={designPair}
              onAnalysisComplete={setAiAnalysis}
            />
          </div>

          {/* Feedback Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Additional Feedback (Optional)
              </CardTitle>
              <CardDescription>
                Share your thoughts on why you chose one design over the other
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="What aspects of the chosen design do you prefer? What could be improved? Any specific elements that stood out?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSubmitReview}
              disabled={!selectedDesign || submitting}
              size="lg"
              className="px-8"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Review...
                </>
              ) : (
                <>
                  <Star className="mr-2 h-5 w-5" />
                  Submit Review
                </>
              )}
            </Button>
          </div>

          {!selectedDesign && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Please select one of the designs above to submit your review
            </p>
          )}
        </div>
      </main>
    </div>
  )
} 