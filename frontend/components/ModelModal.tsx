"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Zap, User, Calendar, ExternalLink, Play, Wallet, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useX402Payment } from "@/hooks/useX402Payment"
import { useWallet } from "@/contexts/WalletContext"
import { testBackendResponse } from "@/lib/paymentClient"
import type { ModelManifest } from "@/types/model"

interface ModelModalProps {
  model: ModelManifest & {
    blobId?: string
    objectId?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ModelModal({ model, isOpen, onClose }: ModelModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const { createVM, isLoading: x402Loading, error: x402Error, clearError } = useX402Payment()
  const { isConnected, isConnecting, connectWallet, error: walletError } = useWallet()

  // Debug: Log the model data to see what we're receiving
  console.log("🔍 ModelModal received model:", {
    id: model.id,
    name: model.name,
    blobId: model.blobId,
    objectId: model.objectId,
    uploader: model.uploader
  })

  const handleTestBackend = async () => {
    try {
      await testBackendResponse({
        objectId: model.objectId,
        uploader: model.uploader
      })
    } catch (error) {
      console.error("Backend test failed:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝"
      case "image":
        return "🎨"
      case "audio":
        return "🎵"
      case "multimodal":
        return "🔗"
      case "embedding":
        return "🧠"
      default:
        return "🤖"
    }
  }

  const formatPrice = (pricing: ModelManifest["pricing"]) => {
    if (!pricing || pricing.mode === "free") return "Free"
    // Fixed 0.5 USDC price for paid models
    return "0.5 USDC"
  }

  const getModelCost = () => {
    if (!model.pricing || model.pricing.mode === "free") {
      return "Free"
    }
    return "0.5 USDC"
  }

  const openWalrusLink = () => {
    if (model.blobId) {
      const url = `https://walruscan.com/testnet/blob/${model.blobId}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleTryNow = async () => {
    if (model.pricing?.mode === "free") {
      // Redirect to playground directly for free models
      window.location.href = `/models/${model.id}/playground`
      return
    }

    // For paid models, create a proper POST form to avoid 405 error
    console.log("💳 Creating POST form to backend payment system...")
    const paymentData = {
      public_key: model.uploader || 'unknown_uploader',
      blob_id: model.objectId || model.blobId || 'unknown_object'
    }
    console.log("📝 Sending data:", paymentData)
    
    // Create a form element
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = 'http://81.15.150.142/api/v1/vms'
    form.target = '_blank' // Open in new tab
    form.style.display = 'none'
    
    // Add form data as hidden inputs
    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.appendChild(input)
    })
    
    // Add to DOM, submit, then remove
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
    
    console.log("✅ Form submitted with POST method to new tab")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}  
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl bg-black/60 modal-scrollbar"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card backdrop-blur-md border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getTypeIcon(model.type)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-balance">{model.name}</h2>
                  <p className="text-muted-foreground">by {model.author || "Unknown"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Model Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Model Image */}
                  <div className="aspect-video relative overflow-hidden rounded-lg ">
                    <img
                      src={model.thumbnailUrl || "/placeholder.svg"}
                      alt={model.name}
                      className="w-full h-full object-cover "
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                      <Badge variant="secondary">
                        {getTypeIcon(model.type)} {model.type}
                      </Badge>
                      <Badge variant="outline" className="bg-background/80">
                        {model.framework}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About this model</h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed">{model.about}</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="w-4 h-4 mr-2" />
                      <span>Author: {model.author || "Unknown"}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Created: {model.createdAt ? new Date(model.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Pricing & Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Pricing</span>
                        <div className="flex items-center text-primary">
                          <Zap className="w-4 h-4 mr-1" />
                          <span className="font-bold">{formatPrice(model.pricing)}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {model.pricing?.mode === "hourly" && model.pricing.pricePerHour && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Access Fee:</span>
                            <span className="font-medium">0.5 USDC</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Network:</span>
                            <span className="font-medium">Base Sepolia</span>
                          </div>
                          <div className="border-t border-border pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total Cost:</span>
                              <span className="font-bold text-lg text-primary">0.5 USDC</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {model.pricing?.mode === "free" && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                          <div className="text-green-600 font-semibold mb-1">Free to Use</div>
                          <div className="text-sm text-muted-foreground">No payment required</div>
                        </div>
                      )}

                      <Button 
                        onClick={handleTryNow} 
                        className="w-full group" 
                        size="lg"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {model.pricing?.mode === "free" ? "Try Now" : "Go to Payment & Access Playground"}
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Instant deployment</span>
                      </div>

                      {/* Debug: Test Backend Button */}
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleTestBackend}
                          className="w-full"
                          title={`Will send: public_key=${model.uploader}, blob_id=${model.objectId}`}
                        >
                          🧪 Test Backend (Form-encoded POST)
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const url = `http://81.15.150.142/api/v1/vms?public_key=${encodeURIComponent(model.uploader || 'test')}&blob_id=${encodeURIComponent(model.objectId || 'test')}`
                            console.log("🧪 Testing GET request to:", url)
                            window.open(url, '_blank')
                          }}
                          className="w-full text-xs"
                        >
                          🔗 Try GET Request (URL params)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Model Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Framework:</span>
                        <span className="font-medium">{model.framework}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{model.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deployment:</span>
                        <span className="font-medium">Fluence Runtime</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage:</span>
                          <span className="font-medium">Walrus Network</span>
                      </div>
                      {model.blobId && (
                        <div className="pt-2">
                          <Button
                            onClick={openWalrusLink}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Walruscan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
