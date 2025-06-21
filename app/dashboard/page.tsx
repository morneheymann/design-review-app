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
import { LogOut, Settings, Users, FileText, Star, Eye, Upload } from "lucide-react"
import { useAuth } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleBrowseDesigns = () => {
    console.log('Browse Designs button clicked')
    router.push('/designs')
  }

  const handleReviewDesigns = () => {
    console.log('Review Designs button clicked')
    router.push('/designs')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
            Here's what's happening with your design reviews today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Collaborators</CardTitle>
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +1 new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +0.2 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Your latest design review activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Homepage Redesign</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile App Icons</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Brand Guidelines</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">3 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
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
                  Browse Designs
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleReviewDesigns}>
                  <Star className="h-4 w-4 mr-2" />
                  Review Designs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Collaborator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your design review workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New review submitted</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mobile App Icons received a 5-star review</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Design approved</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Homepage Redesign has been approved by the team</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Review requested</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Brand Guidelines needs your feedback</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 