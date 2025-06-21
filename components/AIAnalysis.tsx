"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Minus, 
  Loader2,
  Sparkles,
  Eye,
  Target,
  Users,
  Palette
} from "lucide-react"
import { AIAnalysis } from '@/lib/gemini'

interface AIAnalysisProps {
  designPair: {
    id: string
    title: string
    description?: string
    design_a?: { id: string; image_url: string }
    design_b?: { id: string; image_url: string }
  }
  onAnalysisComplete?: (analysis: AIAnalysis) => void
}

export default function AIAnalysisComponent({ designPair, onAnalysisComplete }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const runAnalysis = async () => {
    if (!designPair.design_a?.image_url || !designPair.design_b?.image_url) {
      setError('Both design images are required for analysis')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designAUrl: designPair.design_a.image_url,
          designBUrl: designPair.design_b.image_url,
          title: designPair.title,
          description: designPair.description,
          type: 'pair-analysis'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze designs')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setShowAnalysis(true)
      onAnalysisComplete?.(data.analysis)
    } catch (err) {
      console.error('AI Analysis error:', err)
      setError('Failed to analyze designs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'A':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'B':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'tie':
        return <Minus className="h-5 w-5 text-yellow-500" />
      default:
        return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'A':
        return 'Variation A'
      case 'B':
        return 'Variation B'
      case 'tie':
        return 'Both designs are equally good'
      default:
        return 'No clear winner'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          AI Design Analysis
        </CardTitle>
        <CardDescription>
          Get AI-powered insights on which design variation works better
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showAnalysis && (
          <div className="text-center">
            <Button 
              onClick={runAnalysis} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Designs...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run AI Analysis
                </>
              )}
            </Button>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        )}

        {analysis && showAnalysis && (
          <div className="space-y-6">
            {/* Recommendation */}
            <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                  {getRecommendationIcon(analysis.recommendedDesign)}
                  <span className="ml-2">AI Recommendation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      {getRecommendationText(analysis.recommendedDesign)}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      {analysis.reasoning}
                    </p>
                  </div>
                  <Badge className={getConfidenceColor(analysis.confidence)}>
                    {analysis.confidence}% confidence
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Variation A
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengths.designA.map((strength, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Variation B
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengths.designB.map((strength, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Variation A
                    </h4>
                    <ul className="space-y-1">
                      {analysis.weaknesses.designA.map((weakness, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Variation B
                    </h4>
                    <ul className="space-y-1">
                      {analysis.weaknesses.designB.map((weakness, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Detailed Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                      <Users className="h-4 w-4 mr-2" />
                      User Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.userExperience}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
                      <Eye className="h-4 w-4 mr-2" />
                      Visual Hierarchy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.visualHierarchy}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-teal-700 dark:text-teal-300">
                    <Palette className="h-4 w-4 mr-2" />
                    Design Principles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.designPrinciples.map((principle, index) => (
                      <Badge key={index} variant="secondary">
                        {principle}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                    <Users className="h-4 w-4 mr-2" />
                    Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.accessibility}</p>
                </CardContent>
              </Card>
            </div>

            {/* Hide/Show Toggle */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAnalysis(false)}
                size="sm"
              >
                Hide Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 