import { useState } from "react"
import { api, VMCreationRequest, VMCreationResult } from "@/lib/paymentClient"

export interface UseX402PaymentReturn {
  createVM: (request: VMCreationRequest) => Promise<VMCreationResult>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useX402Payment(): UseX402PaymentReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const createVM = async (request: VMCreationRequest): Promise<VMCreationResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await api.createVM(request)
      
      if (!result.success) {
        setError(result.error || "VM creation failed")
      }
      
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createVM,
    isLoading,
    error,
    clearError,
  }
}