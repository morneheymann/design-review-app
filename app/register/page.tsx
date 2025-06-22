"use client"

import { useState } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Mail, User, Sparkles, ArrowLeft, Shield, Palette, Users } from "lucide-react"
import { signUp } from "@/lib/auth"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  userType: "designer" | "tester"
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  userType?: string
  general?: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "designer"
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.userType) {
      newErrors.userType = "Please select a user type"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      await signUp(formData.email, formData.password, formData.userType, formData.name)
      alert("Account created successfully! Please check your email to verify your account.")
      // Redirect to login after successful registration
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error: any) {
      console.error("Registration error:", error)
      
      // Handle Supabase configuration error
      if (error.message?.includes('Supabase is not configured')) {
        alert("Registration is not configured yet. Please set up your Supabase credentials in the .env.local file.")
        setErrors({ general: "Registration not configured. Please contact the administrator." })
      } else {
        alert(error.message || "Registration failed. Please try again.")
        setErrors({ general: error.message || "Registration failed" })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Versa
                </h1>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-4 shadow-sm border border-white/50">
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              Join the Community
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Create Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Account</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Start your journey with AI-powered design feedback and community reviews
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                    {errors.general}
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">I am a...</Label>
                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => handleInputChange("userType", value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="relative">
                      <RadioGroupItem
                        value="designer"
                        id="designer"
                        className="peer sr-only"
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="designer"
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 transition-all duration-200"
                      >
                        <Palette className="h-6 w-6 text-gray-600 mb-2 peer-data-[state=checked]:text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 peer-data-[state=checked]:text-blue-700">Designer</span>
                        <span className="text-xs text-gray-500 text-center mt-1">Upload & share designs</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem
                        value="tester"
                        id="tester"
                        className="peer sr-only"
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="tester"
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-4 cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 [&:has([data-state=checked])]:border-purple-500 transition-all duration-200"
                      >
                        <Users className="h-6 w-6 text-gray-600 mb-2 peer-data-[state=checked]:text-purple-600" />
                        <span className="text-sm font-medium text-gray-700 peer-data-[state=checked]:text-purple-700">Tester</span>
                        <span className="text-xs text-gray-500 text-center mt-1">Review & provide feedback</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.userType && (
                    <p className="text-sm text-red-600">{errors.userType}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 