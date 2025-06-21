"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Upload, 
  Image, 
  Loader2, 
  CheckCircle, 
  X, 
  ArrowLeft, 
  Sparkles,
  Lightbulb,
  FileImage,
  AlertCircle,
  Info,
  Palette,
  Zap,
  Award
} from "lucide-react"
import { createDesign } from "@/lib/designs"

interface FormData {
  title: string
  description: string
  imageFile1: File | null
  imageFile2: File | null
}

interface FormErrors {
  title?: string
  description?: string
  imageFile1?: string
  imageFile2?: string
  general?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    imageFile1: null,
    imageFile2: null
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [previewUrl1, setPreviewUrl1] = useState<string | null>(null)
  const [previewUrl2, setPreviewUrl2] = useState<string | null>(null)
  const [dragActive1, setDragActive1] = useState(false)
  const [dragActive2, setDragActive2] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.imageFile1) {
      newErrors.imageFile1 = "Please select the first image"
    } else if (!formData.imageFile1.type.startsWith('image/')) {
      newErrors.imageFile1 = "Please select a valid image file"
    }

    if (!formData.imageFile2) {
      newErrors.imageFile2 = "Please select the second image"
    } else if (!formData.imageFile2.type.startsWith('image/')) {
      newErrors.imageFile2 = "Please select a valid image file"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (fileNumber: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(fileNumber, file)
    }
  }

  const handleFile = (fileNumber: 1 | 2, file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ 
        ...prev, 
        [fileNumber === 1 ? 'imageFile1' : 'imageFile2']: 'Please select a valid image file' 
      }))
      return
    }

    const fieldName = fileNumber === 1 ? 'imageFile1' : 'imageFile2'
    setFormData(prev => ({ ...prev, [fieldName]: file }))
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    if (fileNumber === 1) {
      setPreviewUrl1(url)
    } else {
      setPreviewUrl2(url)
    }
    
    // Clear file error
    const errorField = fileNumber === 1 ? 'imageFile1' : 'imageFile2'
    if (errors[errorField]) {
      setErrors(prev => ({ ...prev, [errorField]: undefined }))
    }
  }

  const handleDrag = useCallback((e: React.DragEvent, fileNumber: 1 | 2) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      if (fileNumber === 1) setDragActive1(true)
      else setDragActive2(true)
    } else if (e.type === "dragleave") {
      if (fileNumber === 1) setDragActive1(false)
      else setDragActive2(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, fileNumber: 1 | 2) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (fileNumber === 1) setDragActive1(false)
    else setDragActive2(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(fileNumber, e.dataTransfer.files[0])
    }
  }, [])

  const clearImage = (fileNumber: 1 | 2) => {
    const fieldName = fileNumber === 1 ? 'imageFile1' : 'imageFile2'
    setFormData(prev => ({ ...prev, [fieldName]: null }))
    
    if (fileNumber === 1) {
      setPreviewUrl1(null)
    } else {
      setPreviewUrl2(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    
    try {
      await createDesign({
        title: formData.title,
        description: formData.description,
        imageFile1: formData.imageFile1!,
        imageFile2: formData.imageFile2!
      })
      
      setIsSuccess(true)
      setFormData({ title: "", description: "", imageFile1: null, imageFile2: null })
      setPreviewUrl1(null)
      setPreviewUrl2(null)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error("Upload error:", error)
      setErrors({ general: error.message || "Failed to upload design" })
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

  const renderUploadArea = (fileNumber: 1 | 2, title: string, subtitle: string) => {
    const isDragActive = fileNumber === 1 ? dragActive1 : dragActive2
    const hasFile = fileNumber === 1 ? formData.imageFile1 : formData.imageFile2
    const previewUrl = fileNumber === 1 ? previewUrl1 : previewUrl2
    const error = fileNumber === 1 ? errors.imageFile1 : errors.imageFile2

    return (
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-gray-900">{title}</Label>
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105' 
              : hasFile 
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' 
                : error 
                  ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50' 
                  : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]'
          }`}
          onDragEnter={(e) => handleDrag(e, fileNumber)}
          onDragLeave={(e) => handleDrag(e, fileNumber)}
          onDragOver={(e) => handleDrag(e, fileNumber)}
          onDrop={(e) => handleDrop(e, fileNumber)}
        >
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-3 right-3 shadow-lg hover:scale-110 transition-transform"
                onClick={() => clearImage(fileNumber)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileImage className="h-10 w-10 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-3">{subtitle}</p>
              <p className="text-sm text-gray-500 mb-6">
                PNG, JPG, GIF up to 10MB
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`file-${fileNumber}`)?.click()}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-medium py-3 transition-all duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Choose File
              </Button>
            </div>
          )}
          <input
            id={`file-${fileNumber}`}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(fileNumber, e)}
            className="hidden"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold mb-6 shadow-lg border border-white/50">
              <Sparkles className="h-5 w-5 mr-3 animate-pulse" />
              Create Design Comparison
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upload Your Designs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Upload two design variations to compare and get AI-powered feedback. 
              This helps you make better design decisions and improve your work.
            </p>
          </div>
        </div>

        {/* Tips Card */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">Tips for better results:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-blue-800 space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Use high-quality images (PNG, JPG, or GIF)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Make sure both designs are the same size
                    </li>
                  </ul>
                  <ul className="text-blue-800 space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Provide clear, descriptive titles
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Focus on specific design elements
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Design Comparison Details</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Fill in the details and upload your design variations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            {isSuccess && (
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-green-900 font-semibold text-lg">Success!</h4>
                  <p className="text-green-800">Design comparison uploaded successfully! Redirecting to dashboard...</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-10">
              {errors.general && (
                <div className="p-6 text-sm text-red-500 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl flex items-center shadow-lg">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  {errors.general}
                </div>
              )}
              
              {/* Title and Description */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-lg font-semibold text-gray-900">
                    Design Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Homepage Header Design"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`text-lg py-4 px-4 border-2 rounded-xl transition-all duration-200 ${
                      errors.title ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-semibold text-gray-900">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you're comparing and what feedback you're looking for..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`text-lg py-4 px-4 border-2 rounded-xl transition-all duration-200 ${
                      errors.description ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    disabled={isLoading}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {renderUploadArea(1, "Design A", "Upload your first design variation")}
                {renderUploadArea(2, "Design B", "Upload your second design variation")}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6 mr-3" />
                      Create Design Comparison
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-lg shadow-lg">
            <Info className="h-5 w-5 mr-3" />
            Need help? Check out our design guidelines for best results
          </div>
        </div>
      </div>
    </div>
  )
} 