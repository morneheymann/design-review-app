"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Settings, Users, FileText, Star, Eye, Upload, Image, Calendar, TrendingUp, Activity, GitCompare, Sparkles, Palette, BarChart3, Zap } from "lucide-react"
import { useAuth, signOut } from "@/lib/auth"
import { useEffect, useState } from "react"
import { getUserDesigns, getUserDesignPairs, getDesignerStats } from "@/lib/designs"
import { Design, DesignPair } from "@/lib/database.types"

interface DashboardStats {
  totalDesigns: number
  totalPairs: number
  totalRatings: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userDesigns, setUserDesigns] = useState<Design[]>([])
  const [userDesignPairs, setUserDesignPairs] = useState<DesignPair[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalDesigns: 0, totalPairs: 0, totalRatings: 0 })
  const [loadingData, setLoadingData] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      loadDashboardData()
    }
  }, [user, loading])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setLoadingData(true)
      
      // Load user's individual designs
      const designs = await getUserDesigns(user.id)
      setUserDesigns(designs)
      
      // Load user's design pairs (comparisons)
      const designPairs = await getUserDesignPairs(user.id)
      setUserDesignPairs(designPairs)
      
      // Load user's stats
      const userStats = await getDesignerStats(user.id)
      setStats(userStats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setLoggingOut(false)
    }
  }

  const handleBrowseDesigns = () => {
    router.push('/designs')
  }

  const handleReviewDesigns = () => {
    router.push('/designs')
  }

  const handleViewDesign = (designId: string) => {
    router.push(`/design/${designId}`)
  }

  const handleViewComparison = (pairId: string) => {
    router.push(`/review/${pairId}`)
  }

  // Get user's first name from user metadata or email
  const getFirstName = () => {
    if (!user) return "Designer"
    
    // Try to get name from user metadata first
    const name = user.user_metadata?.name
    if (name) {
      return name.split(' ')[0] // Get first name only
    }
    
    // Fallback to email prefix
    const email = user.email
    if (email) {
      return email.split('@')[0]
    }
    
    return "Designer"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your dashboard...</h2>
        </div>
      </div>
    )
  }

  const totalItems = userDesigns.length + userDesignPairs.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Versa
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={loggingOut}
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-4 shadow-sm border border-white/50">
            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            Welcome back!
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hello, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{getFirstName()}</span>!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Here's your design activity and analytics overview. Track your progress and manage your creative work.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Designs</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Image className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">{stats.totalDesigns}</div>
              <p className="text-sm text-gray-600">
                Your uploaded designs
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Design Pairs</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <GitCompare className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">{stats.totalPairs}</div>
              <p className="text-sm text-gray-600">
                Created for review
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-yellow-50/30 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Reviews</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">{stats.totalRatings}</div>
              <p className="text-sm text-gray-600">
                Received feedback
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/30 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Activity</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">{totalItems}</div>
              <p className="text-sm text-gray-600">
                Total items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              asChild 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-4 rounded-xl group"
            >
              <Link href="/upload">
                <Upload className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Upload New Design
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-white/50 transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-4 rounded-xl"
            >
              <Link href="/designs">
                <Eye className="mr-3 h-5 w-5" />
                Browse Designs
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Designs */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Image className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Your Designs</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Link href="/designs?view=my-designs">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userDesigns.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No designs uploaded yet</p>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Link href="/upload">Upload Your First Design</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDesigns.slice(0, 3).map((design) => (
                    <div
                      key={design.id}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleViewDesign(design.id)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Image className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{design.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(design.created_at)}</p>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Comparisons */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <GitCompare className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Design Comparisons</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-green-600 hover:text-green-700 hover:bg-green-50">
                  <Link href="/designs?view=my-comparisons">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userDesignPairs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GitCompare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No design comparisons yet</p>
                  <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Link href="/upload">Create Your First Comparison</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDesignPairs.slice(0, 3).map((pair) => (
                    <div
                      key={pair.id}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleViewComparison(pair.id)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <GitCompare className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{pair.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(pair.created_at)}</p>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 