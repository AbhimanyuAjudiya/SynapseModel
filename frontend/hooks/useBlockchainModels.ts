import { useState, useEffect } from 'react'
import { getAllModelsFromBlockchain, convertToModelManifest, type ModelData } from '@/lib/modelRegistryClient'
import type { ModelManifest } from '@/types/model'

export function useBlockchainModels() {
  const [models, setModels] = useState<ModelManifest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModels = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching models from blockchain...')
      const blockchainModels = await getAllModelsFromBlockchain()
      
      // Convert blockchain data to frontend format
      const convertedModels = blockchainModels.map(convertToModelManifest)
      
      console.log('✅ Models fetched and converted:', convertedModels)
      setModels(convertedModels)
      
    } catch (err) {
      console.error('❌ Error fetching blockchain models:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch models')
      setModels([]) // Fallback to empty array
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  return {
    models,
    loading,
    error,
    refetch: fetchModels
  }
}