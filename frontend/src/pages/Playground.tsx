import { useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
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

function PlaygroundContent() {
  const { id } = useParams<{ id: string }>()
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

  const handlePublicKeyChange = (key: string) => {
    setPublicKey(key)
  }

  const handleFetchVMId = async () => {
    await fetchVMId()
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

        {/* Main Content */}
        <div className="space-y-6">
          {/* VM Control Panel - Always visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
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