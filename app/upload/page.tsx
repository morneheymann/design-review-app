"use client"

import { useState } from "react"
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
import { Upload, Image, Loader2, CheckCircle, X, ArrowLeft } from "lucide-react"
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
  }

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
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Upload Design Comparison</CardTitle>
          <CardDescription className="text-center">
            Upload two design variations for comparison and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">Design comparison uploaded successfully!</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Design Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a descriptive title for your design comparison"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your design variations, the problem they solve, and what you'd like reviewers to focus on..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                rows={4}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image1">Design Variation A</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="image1"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(1, e)}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label htmlFor="image1" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
                {errors.imageFile1 && (
                  <p className="text-sm text-red-500">{errors.imageFile1}</p>
                )}
              </div>

              {/* Second Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image2">Design Variation B</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="image2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(2, e)}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label htmlFor="image2" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
                {errors.imageFile2 && (
                  <p className="text-sm text-red-500">{errors.imageFile2}</p>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {(previewUrl1 || previewUrl2) && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previewUrl1 && (
                    <div className="relative border rounded-lg p-4 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => clearImage(1)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <img
                        src={previewUrl1}
                        alt="Variation A Preview"
                        className="max-w-full h-auto max-h-64 mx-auto rounded"
                      />
                      <p className="text-center text-sm text-gray-600 mt-2">Variation A</p>
                    </div>
                  )}
                  {previewUrl2 && (
                    <div className="relative border rounded-lg p-4 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => clearImage(2)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <img
                        src={previewUrl2}
                        alt="Variation B Preview"
                        className="max-w-full h-auto max-h-64 mx-auto rounded"
                      />
                      <p className="text-center text-sm text-gray-600 mt-2">Variation B</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Design Comparison...
                </>
              ) : (
                <>
                  <Image className="mr-2 h-4 w-4" />
                  Upload Design Comparison
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 