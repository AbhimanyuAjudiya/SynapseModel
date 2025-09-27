"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { Upload, X, CheckCircle, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileDropzone } from "@/components/FileDropzone"
import { uploadToWalrus, type UploadProgress } from "@/lib/walrusClient"
import { useWallet } from "@/hooks/useWallet"
import type { ModelType, PricingMode } from "@/types/model"

interface UploadFormData {
  name: string
  type: ModelType
  framework: string
  description: string
  tags: string[]
  pricingMode: PricingMode
  pricePerHour?: number
}

const modelTypes: { value: ModelType; label: string }[] = [
  { value: "text", label: "Text Generation" },
  { value: "image", label: "Image Generation" },
  { value: "audio", label: "Audio Processing" },
  { value: "multimodal", label: "Multimodal" },
  { value: "embedding", label: "Embeddings" },
]

const frameworks = [
  { value: "PyTorch", label: "PyTorch" },
  { value: "TensorFlow", label: "TensorFlow" },
  { value: "ONNX", label: "ONNX" },
  { value: "Custom", label: "Custom" },
]

const pricingModes: { value: PricingMode; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "custom", label: "Custom Pricing" },
]

export function UploadForm() {
  const { address } = useWallet()
  const [modelFiles, setModelFiles] = useState<File[]>([])
  const [scriptFiles, setScriptFiles] = useState<File[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>({
    defaultValues: {
      tags: [],
      pricingMode: "free",
    },
  })

  const watchedTags = watch("tags") || []
  const watchedPricingMode = watch("pricingMode")

  const addTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim())) {
      setValue("tags", [...watchedTags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const onSubmit = async (data: UploadFormData) => {
    if (modelFiles.length === 0) {
      setUploadError("Please select at least one model file")
      return
    }

    setUploadError("")
    setUploadSuccess(false)

    try {
      // Combine all files for upload
      const allFiles = [...modelFiles, ...scriptFiles]

      // Upload to Walrus
      const uploadResult = await uploadToWalrus(allFiles, setUploadProgress)

      // Create model manifest
      const modelManifest = {
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        about: data.description,
        type: data.type,
        tags: data.tags,
        framework: data.framework,
        pricing:
          data.pricingMode === "free"
            ? { mode: "free" as const }
            : data.pricingMode === "hourly"
              ? { mode: "hourly" as const, pricePerHour: data.pricePerHour || 0 }
              : { mode: "custom" as const },
        author: address,
        createdAt: new Date().toISOString(),
        walrusCid: uploadResult.cid,
        manifestUrl: uploadResult.manifestUrl,
      }

      // In a real app, this would register the model on-chain
      console.log("Model manifest:", modelManifest)

      setUploadSuccess(true)
      setUploadProgress(null)

      // Reset form after successful upload
      setTimeout(() => {
        window.location.href = "/models"
      }, 3000)
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
      setUploadProgress(null)
    }
  }

  if (uploadSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
        <p className="text-muted-foreground mb-4">Your AI model has been uploaded and published to the marketplace.</p>
        <p className="text-sm text-muted-foreground">Redirecting to models page...</p>
      </motion.div>
    )
  }

  if (uploadProgress) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Uploading Model</h2>
        <p className="text-muted-foreground mb-4 capitalize">{uploadProgress.stage}...</p>
        <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress.progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{Math.round(uploadProgress.progress)}% complete</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Model Name *</label>
              <Input
                {...register("name", { required: "Model name is required" })}
                placeholder="e.g., GPT-4 Turbo"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Model Type *</label>
              <Select onValueChange={(value) => setValue("type", value as ModelType)}>
                <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {modelTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Framework *</label>
            <Select onValueChange={(value) => setValue("framework", value)}>
              <SelectTrigger className={errors.framework ? "border-destructive" : ""}>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((framework) => (
                  <SelectItem key={framework.value} value={framework.value}>
                    {framework.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.framework && <p className="text-sm text-destructive mt-1">{errors.framework.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <Textarea
              {...register("description", { required: "Description is required" })}
              placeholder="Describe your AI model, its capabilities, and use cases..."
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags (press Enter)"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Model Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Model Files *</label>
            <FileDropzone
              files={modelFiles}
              onFilesChange={setModelFiles}
              accept=".pt,.pth,.pb,.h5,.onnx,.pkl,.bin,.safetensors"
              maxFiles={10}
              maxSize={1024 * 1024 * 1024} // 1GB
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload your model files (.pt, .pth, .pb, .h5, .onnx, etc.)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Script Files (Optional)</label>
            <FileDropzone
              files={scriptFiles}
              onFilesChange={setScriptFiles}
              accept=".py,.js,.sh,.yaml,.yml,.json,.txt,.md"
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload inference scripts, configuration files, or documentation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Pricing Mode *</label>
            <Select onValueChange={(value) => setValue("pricingMode", value as PricingMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pricing mode" />
              </SelectTrigger>
              <SelectContent>
                {pricingModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {watchedPricingMode === "hourly" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Price per Hour (POL) *</label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                {...register("pricePerHour", {
                  required: watchedPricingMode === "hourly" ? "Price per hour is required" : false,
                  min: { value: 0, message: "Price must be positive" },
                })}
                placeholder="0.05"
                className={errors.pricePerHour ? "border-destructive" : ""}
              />
              {errors.pricePerHour && <p className="text-sm text-destructive mt-1">{errors.pricePerHour.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Set your hourly rate in POL tokens</p>
            </div>
          )}

          {watchedPricingMode === "custom" && (
            <Alert>
              <AlertDescription>
                Custom pricing will require manual negotiation with users. You can be contacted through your wallet
                address.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || modelFiles.length === 0} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Publish Model
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
