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
import { LogOut, Settings, Users, FileText, Star, Eye, Upload, Image, Calendar, TrendingUp, Activity } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"
import { getUserDesigns, getDesignerStats } from "@/lib/designs"
import { Design } from "@/lib/database.types"

interface DashboardStats {
  totalDesigns: number
  totalPairs: number
  totalRatings: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userDesigns, setUserDesigns] = useState<Design[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalDesigns: 0, totalPairs: 0, totalRatings: 0 })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user && !loading) {
      loadDashboardData()
    }
  }, [user, loading])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setLoadingData(true)
      
      // Load user's designs
      const designs = await getUserDesigns(user.id)
      setUserDesigns(designs)
      
      // Load user's stats
      const userStats = await getDesignerStats(user.id)
      setStats(userStats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoadingData(false)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Design Review App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hello, {getFirstName()}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your design activity and analytics overview.
          </p>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
              <Image className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalDesigns}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your uploaded designs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Design Pairs</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalPairs}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created for review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalRatings}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Received feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {userDesigns.length > 0 ? 'Active' : 'New'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userDesigns.length > 0 ? 'Designer account' : 'Get started!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User's Designs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Your Designs
              </CardTitle>
              <CardDescription>
                Designs you've uploaded ({userDesigns.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userDesigns.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You haven't uploaded any designs yet.
                  </p>
                  <Button asChild>
                    <Link href="/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Design
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDesigns.slice(0, 5).map((design) => (
                    <div key={design.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{design.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(design.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDesign(design.id)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  {userDesigns.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/designs">
                          View all {userDesigns.length} designs
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Design
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleBrowseDesigns}>
                  <Eye className="h-4 w-4 mr-2" />
                  Browse All Designs
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleReviewDesigns}>
                  <Star className="h-4 w-4 mr-2" />
                  Review Designs
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/designs">
                    <Users className="h-4 w-4 mr-2" />
                    View Community
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest design activities and reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userDesigns.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity. Start by uploading your first design!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userDesigns.slice(0, 3).map((design) => (
                  <div key={design.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Uploaded "{design.title}"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(design.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDesign(design.id)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 