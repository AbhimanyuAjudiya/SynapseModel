import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { UploadForm } from "@/components/UploadForm"
import { useWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Upload as UploadIcon, AlertTriangle } from "lucide-react"

export default function Upload() {
  const { isConnected, isOnSupportedChain, connectWallet, switchToPolygon } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Upload AI Model</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Share your AI model with the community and start earning from your work
          </p>
        </motion.div>

        {/* Wallet Connection Required */}
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet Connection Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔗</div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-6 text-pretty">
                    You need to connect your wallet to upload and publish AI models on the blockchain
                  </p>
                  <Button onClick={connectWallet} size="lg">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : !isOnSupportedChain ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Please switch to Polygon network to upload models</span>
                <Button variant="outline" size="sm" onClick={switchToPolygon} className="ml-2 bg-transparent">
                  Switch Network
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <UploadForm />
          </motion.div>
        )}

        {/* Upload Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UploadIcon className="w-5 h-5" />
                <span>Upload Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Supported Formats</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• PyTorch (.pt, .pth)</li>
                    <li>• TensorFlow (.pb, .h5)</li>
                    <li>• ONNX (.onnx)</li>
                    <li>• Hugging Face models</li>
                    <li>• Custom formats with scripts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Include clear model description</li>
                    <li>• Add relevant tags for discovery</li>
                    <li>• Test your model before upload</li>
                    <li>• Set fair pricing for usage</li>
                    <li>• Provide example inputs/outputs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}