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
  Info
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
      <div className="space-y-3">
        <Label className="text-base font-medium">{title}</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : hasFile 
                ? 'border-green-500 bg-green-50' 
                : error 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
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
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => clearImage(fileNumber)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
              <p className="text-xs text-gray-500 mb-4">
                PNG, JPG, GIF up to 10MB
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`file-${fileNumber}`)?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
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
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Design Comparison
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Your Designs
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload two design variations to compare and get AI-powered feedback. 
              This helps you make better design decisions.
            </p>
          </div>
        </div>

        {/* Tips Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Tips for better results:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use high-quality images (PNG, JPG, or GIF)</li>
                  <li>• Make sure both designs are the same size and format</li>
                  <li>• Provide clear, descriptive titles and descriptions</li>
                  <li>• Focus on specific design elements you want feedback on</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Design Comparison Details</CardTitle>
            <CardDescription>
              Fill in the details and upload your design variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">Design comparison uploaded successfully! Redirecting to dashboard...</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.general && (
                <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.general}
                </div>
              )}
              
              {/* Title and Description */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Design Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Homepage Header Design"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you're comparing and what feedback you're looking for..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                    disabled={isLoading}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Upload Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderUploadArea(1, "Design A", "Upload your first design variation")}
                {renderUploadArea(2, "Design B", "Upload your second design variation")}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Create Design Comparison
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
            <Info className="h-4 w-4 mr-2" />
            Need help? Check out our design guidelines for best results
          </div>
        </div>
      </div>
    </div>
  )
} 