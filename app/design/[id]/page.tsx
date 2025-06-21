"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDesignById } from '@/lib/designs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Eye, Calendar, Sparkles, Palette, Image, User, FileText, Download, Share2, Edit, Trash2 } from "lucide-react"
import { useAuth } from '@/lib/auth'

export default function DesignPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const designId = params.id as string

  const [design, setDesign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!designId) {
      setError('No design ID provided')
      setLoading(false)
      return
    }

    console.log('DesignPage: Component rendering with designId:', designId)
    
    const loadDesign = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log('DesignPage: Starting to load design...')
        
        // Add a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
        
        const loadPromise = getDesignById(designId)
        const result = await Promise.race([loadPromise, timeoutPromise]) as any
        
        console.log('DesignPage: Successfully loaded design:', result)
        
        if (!result) {
          setError('Design not found')
        } else {
          setDesign(result)
        }
      } catch (err) {
        console.error('DesignPage: Error loading design:', err)
        setError(err instanceof Error ? err.message : 'Failed to load design')
      } finally {
        setLoading(false)
      }
    }
    
    loadDesign()
  }, [designId])

  console.log('DesignPage: Render state:', {
    loading,
    error,
    design: design ? 'loaded' : null,
    designId
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading design...</h2>
          <p className="text-sm text-gray-500 mt-2">ID: {designId}</p>
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
              <Image className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Design</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <p className="text-sm text-gray-500 mb-8">Design ID: {designId}</p>
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

  if (!design) {
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
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">The requested design could not be found.</p>
            <p className="text-sm text-gray-500 mb-8">Design ID: {designId}</p>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOwner = user && design.designer_id === user.id

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
            <div className="flex items-center space-x-3">
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Design Header */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-4 shadow-sm border border-white/50">
            <Palette className="h-4 w-4 mr-2" />
            Individual Design
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {design.title}
          </h1>
          {design.description && (
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-6">
              {design.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Design Image */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={design.image_url}
                    alt={design.title}
                    className="w-full h-auto object-contain rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                    style={{ maxHeight: '600px' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-t-xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="lg" className="bg-white/90 hover:bg-white text-gray-900 shadow-lg">
                        <Eye className="h-5 w-5 mr-2" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Design Information */}
          <div className="space-y-6">
            {/* Design Details */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Design Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Designer</p>
                    <p className="text-sm text-gray-600">{design.designer?.name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(design.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Image className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Status</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {design.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-green-600" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                  onClick={() => window.open(design.image_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Design
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-white/50 transform hover:scale-105 transition-all duration-300 font-semibold"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                {isOwner && (
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-green-300 hover:border-green-400 hover:bg-green-50 text-green-600 hover:text-green-700 transform hover:scale-105 transition-all duration-300 font-semibold"
                    onClick={() => router.push(`/upload?edit=${design.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Design
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Design ID */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  Technical Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Design ID</p>
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded break-all">
                      {design.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Designer ID</p>
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded break-all">
                      {design.designer_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 