import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
<<<<<<< Updated upstream
import { Navbar } from "../../components/Navbar"
import { Footer } from "../../components/Footer"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { VMDashboard } from "../components/VMDashboard"
import { VMControlPanel } from "../components/VMControlPanel"
import { ModelExecution } from "../components/ModelExecution"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { useVM } from "../hooks/useVM"
import { Server, Brain, Zap, Settings } from "lucide-react"
=======
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Copy, Download, Wallet, CheckCircle } from "lucide-react"
import { useX402Payment } from "@/hooks/useX402Payment"
>>>>>>> Stashed changes

function PlaygroundContent() {
  const { id } = useParams<{ id: string }>()
<<<<<<< Updated upstream
  const [activeTab, setActiveTab] = useState<'dashboard' | 'execution'>('dashboard')
  
  const {
    vmInfo,
    currentVmId,
    publicKey,
    loading,
    error,
    executionResult,
    setPublicKey,
    setCurrentVmId,
    fetchVMInfo,
    fetchVMId,
    deleteVM,
    executeModel,
    executeSentiment,
    clearError,
    clearExecutionResult,
  } = useVM()
=======
  const { createVM, isLoading: x402Loading, error: x402Error } = useX402Payment()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [walletConnected, setWalletConnected] = useState(false)

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          setWalletConnected(accounts && accounts.length > 0)
        } catch (error) {
          console.error("Failed to check wallet connection:", error)
        }
      }
    }
    checkWallet()
  }, [])
>>>>>>> Stashed changes

  const handlePublicKeyChange = (key: string) => {
    setPublicKey(key)
  }

<<<<<<< Updated upstream
  const handleFetchVMId = async () => {
    await fetchVMId()
=======
  const runModel = async () => {
    if (!input.trim()) return
    
    setIsRunning(true)
    setPaymentStatus('processing')
    
    try {
      // Create VM with x402 payment
      const vmResult = await createVM({
        public_key: `playground_${Date.now()}`,
        blob_id: model.id,
      })

      if (!vmResult.success) {
        setPaymentStatus('failed')
        setOutput(`❌ Payment failed: ${vmResult.error}\n\nPlease check your wallet connection and ensure you have sufficient funds on Base Sepolia.`)
        return
      }

      setPaymentStatus('completed')
      
      // Simulate model execution after successful payment
      setTimeout(() => {
        setOutput(`✅ Payment processed via x402 on Base Sepolia!\n\nVM ID: ${vmResult.vmId}\n\n🤖 Model Response:\n"${input}"\n\nThis is a simulated response from the ${model.name} model running on the paid VM. The x402 payment system automatically handled the micropayment for this model inference on Base Sepolia network.`)
        setIsRunning(false)
        // Reset payment status after successful execution
        setTimeout(() => setPaymentStatus('idle'), 3000)
      }, 2000)
      
    } catch (error) {
      setPaymentStatus('failed')
      setOutput(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease ensure MetaMask is connected to Base Sepolia and you have sufficient ETH.`)
      setIsRunning(false)
    }
>>>>>>> Stashed changes
  }

  const handleRefreshVMInfo = async () => {
    await fetchVMInfo()
  }

  const handleDeleteVM = async () => {
    if (confirm('Are you sure you want to delete this VM instance? This action cannot be undone and will permanently remove your VM and all data.')) {
      await deleteVM()
    }
  }

  const handleStartInteractiveMode = () => {
    setActiveTab('execution')
  }

  const handleExecuteModel = async (input: string) => {
    await executeModel(input)
  }

  const handleExecuteSentiment = async (text: string) => {
    await executeSentiment(text)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
                <Server className="w-8 h-8 text-primary" />
                VM Playground
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage and execute models on virtual machines
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                VM Dashboard
              </Button>
              <Button
                variant={activeTab === 'execution' ? 'default' : 'outline'}
                onClick={() => setActiveTab('execution')}
                disabled={!vmInfo?.ip}
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Model Execution
              </Button>
            </div>
          </div>

          {/* Status Bar */}
          <Card className="bg-muted/30">
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  {vmInfo ? (
                    <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Connected</Badge>
                  )}
                </div>
                
                {vmInfo && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">VM ID:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {vmInfo.id.substring(0, 8)}...
                      </code>
                    </div>
                    
                    {vmInfo.ip && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">IP:</span>
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          {vmInfo.ip}
                        </code>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Mode:</span>
                  <Badge variant="outline">
                    <Zap className="w-3 h-3 mr-1" />
                    Interactive
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

<<<<<<< Updated upstream
        {/* Main Content */}
        <div className="space-y-6">
          {/* VM Control Panel - Always visible */}
=======
        {/* Payment Status Alert */}
        {paymentStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Alert className={paymentStatus === 'failed' ? 'border-red-200 bg-red-50' : paymentStatus === 'completed' ? 'border-green-200 bg-green-50' : ''}>
              {paymentStatus === 'processing' ? (
                <Wallet className="w-4 h-4 animate-pulse" />
              ) : paymentStatus === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Wallet className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription>
                {paymentStatus === 'processing' && 'Processing payment via x402 on Base Sepolia...'}
                {paymentStatus === 'completed' && '✅ Payment completed! VM is ready for model execution.'}
                {paymentStatus === 'failed' && '❌ Payment failed. Please check your wallet and try again.'}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Playground Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
>>>>>>> Stashed changes
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
<<<<<<< Updated upstream
            <VMControlPanel
              publicKey={publicKey}
              currentVmId={currentVmId}
              loading={{
                fetchingId: loading.fetchingId,
                fetchingInfo: loading.fetchingInfo,
              }}
              error={error}
              onPublicKeyChange={handlePublicKeyChange}
              onFetchVMId={handleFetchVMId}
              onClearError={clearError}
            />
=======
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Input
                  <Button 
                    onClick={runModel} 
                    disabled={!input.trim() || isRunning || x402Loading}
                    className="ml-2"
                  >
                    {paymentStatus === 'processing' ? (
                      <><Wallet className="w-4 h-4 mr-2" /> Processing Payment...</>
                    ) : isRunning ? (
                      <><Play className="w-4 h-4 mr-2" /> Running...</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" /> Run Model</>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your prompt or input here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </CardContent>
            </Card>
>>>>>>> Stashed changes
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {activeTab === 'dashboard' ? (
              <VMDashboard
                vmInfo={vmInfo}
                loading={{
                  fetchingInfo: loading.fetchingInfo,
                  deleting: loading.deleting,
                }}
                error={error}
                onRefresh={handleRefreshVMInfo}
                onDelete={handleDeleteVM}
                onClearError={clearError}
                onStartInteractiveMode={handleStartInteractiveMode}
              />
            ) : (
              <ModelExecution
                vmIp={vmInfo?.ip || null}
                loading={loading.executing}
                executionResult={executionResult}
                onExecuteModel={handleExecuteModel}
                onExecuteSentiment={handleExecuteSentiment}
                onClearResult={clearExecutionResult}
              />
            )}
          </motion.div>

          {/* Usage Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Getting Started</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Enter your wallet's public key to connect</li>
                      <li>• Your VM will be automatically fetched and connected</li>
                      <li>• Use Interactive Mode to start executing models</li>
                      <li>• Monitor your VM status in the dashboard</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Model Execution</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• General models for text generation and processing</li>
                      <li>• Sentiment analysis for text classification</li>
                      <li>• Real-time results with detailed feedback</li>
                      <li>• Export and download execution results</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">VM Management</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Interactive Mode:</strong> Execute models and analyze data in real-time</p>
                    <p>• <strong>Delete Instance:</strong> Permanently remove your VM when no longer needed</p>
                    <p>• <strong>Refresh:</strong> Update VM status and connection information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
<<<<<<< Updated upstream
=======

        {/* Usage Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific and clear in your prompts</li>
                    <li>• Provide context when necessary</li>
                    <li>• Start with simple queries to understand the model</li>
                    <li>• Experiment with different input formats</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">X402 Payments</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic micropayments via MetaMask</li>
                    <li>• Payments processed on Base Sepolia</li>
                    <li>• Pay only for actual model usage</li>
                    <li>• Transparent pricing and billing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Limitations</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Responses are limited to model capabilities</li>
                    <li>• Processing time depends on input complexity</li>
                    <li>• MetaMask connection required for payments</li>
                    <li>• Sufficient funds needed on Polygon Amoy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
>>>>>>> Stashed changes
      </main>

      <Footer />
    </div>
  )
}

export default function Playground() {
  return (
    <ErrorBoundary>
      <PlaygroundContent />
    </ErrorBoundary>
  )
}