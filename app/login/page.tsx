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
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles, AlertCircle, Palette, Shield, Zap } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-b-transparent animate-spin-reverse"></div>
          </div>
          <h2 className="text-xl font-semibold text-white">Checking authentication...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-6 shadow-lg border border-white/50">
                <Sparkles className="h-5 w-5 mr-3 animate-pulse" />
                Welcome Back
              </div>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Design Review App
                </h1>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Sign In</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Access your design projects and continue creating amazing work
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-6 text-sm text-red-500 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl flex items-center shadow-lg">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-lg font-semibold text-gray-900">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Mail className="h-3 w-3 text-white" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-12 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                      errors.email 
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-lg font-semibold text-gray-900">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Lock className="h-3 w-3 text-white" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-12 pr-12 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                      errors.password 
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-500 p-0 h-auto font-medium"
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Zap className="mr-3 h-5 w-5" />
                    Sign In to Your Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-8">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                Join thousands of designers getting better feedback
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-6 py-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-lg shadow-lg">
            <Shield className="h-5 w-5 mr-3" />
            Your data is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  )
} 