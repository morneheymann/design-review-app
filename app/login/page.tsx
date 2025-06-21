"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles, AlertCircle } from "lucide-react"
import { signIn, useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    
    try {
      await signIn(formData.email, formData.password)
      // The useAuth hook will automatically update the user state
      // and the useEffect above will handle the redirect
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Handle different error types
      if (error.message?.includes('Supabase is not configured')) {
        setErrors({ general: "Authentication is not configured. Please contact the administrator." })
      } else if (error.message?.includes('Invalid login credentials')) {
        setErrors({ general: "Invalid email or password. Please check your credentials and try again." })
      } else if (error.message?.includes('Email not confirmed')) {
        setErrors({ general: "Please check your email and confirm your account before signing in." })
      } else {
        setErrors({ general: error.message || "An error occurred during sign in. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }))
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Checking authentication...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                Welcome Back
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Access your design projects and continue creating
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-500 p-0 h-auto"
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 text-base font-medium" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In to Your Account"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Join thousands of designers getting better feedback
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Having trouble? Contact support for help
          </div>
        </div>
      </div>
    </div>
  )
} 