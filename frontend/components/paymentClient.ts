<<<<<<< Updated upstream:frontend/components/paymentClient.ts
import { writeContract, waitForTransactionReceipt } from "wagmi/actions"
import { config } from "../lib/web3"
import { parseEther } from "viem"
=======
import axios from "axios"
import type { AxiosInstance } from "axios"
import type { WalletClient } from "viem"
import { withPaymentInterceptor } from "x402-axios"
>>>>>>> Stashed changes:frontend/lib/paymentClient.ts

// VM Creation interfaces
export interface VMCreationRequest {
  public_key: string
  blob_id: string
}

export interface VMCreationResult {
  success: boolean
  vmId?: string
  error?: string
}

// X402 Payment Configuration for Base Sepolia  
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://81.15.150.142"

// Base axios instance without payment interceptor
const baseApiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// This will be dynamically set based on wallet connection
let apiClient: AxiosInstance = baseApiClient

// Update the API client with a wallet for x402 payments
export function updateApiClient(walletClient: WalletClient | null) {
  if (walletClient && walletClient.account) {
    // Create axios instance with x402 payment interceptor
    // This will automatically handle 402 responses by paying 0.5 USDC
    apiClient = withPaymentInterceptor(baseApiClient, walletClient as any)
    console.log("💳 API client updated with x402 payment support for:", walletClient.account.address)
    console.log("💳 Wallet client details:", {
      account: walletClient.account.address,
      chain: walletClient.chain?.name,
      chainId: walletClient.chain?.id
    })
  } else {
    // No wallet connected - reset to base client
    apiClient = baseApiClient
    console.log("⚠️ API client reset - no wallet connected")
  }
}

// Test function to check backend response
export const testBackendResponse = async (modelData?: { objectId?: string, uploader?: string }) => {
  try {
    console.log("🧪 Testing backend response...")
    const testPayload = {
      public_key: modelData?.uploader || "test_uploader_address",
      blob_id: modelData?.objectId || "test_object_id"
    }
    console.log("🧪 Sending POST payload:", testPayload)
    
    // Try form-encoded data instead of JSON
    const formData = new URLSearchParams()
    formData.append('public_key', testPayload.public_key)
    formData.append('blob_id', testPayload.blob_id)
    
    const response = await fetch('http://81.15.150.142/api/v1/vms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })
    
    console.log("🧪 Backend responded with status:", response.status)
    
    if (response.ok) {
      const data = await response.text() // Try text first in case it's not JSON
      console.log("🧪 Backend response data:", data)
      return { status: response.status, data }
    } else {
      const errorText = await response.text()
      console.log("🧪 Backend error response:", errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  } catch (error: any) {
    console.log("🧪 Full error:", error)
    throw error
  }
}

// Main API for VM creation with automatic x402 payment handling
export const api = {
  // Create VM with automatic 0.5 USDC payment on 402 response
  createVM: async (request: VMCreationRequest): Promise<VMCreationResult> => {
    try {
      console.log("🚀 Creating VM - will pay 0.5 USDC if 402 response...")
      console.log("🚀 Request details:", request)
      console.log("🚀 Backend URL:", BACKEND_BASE_URL)
      console.log("🚀 Using API client:", apiClient === baseApiClient ? "base client (no x402)" : "x402-enabled client")
      
      // Make request to /api/v1/vms
      // If server responds with 402, x402 interceptor will:
      // 1. Parse the payment requirements
      // 2. Automatically pay 0.5 USDC on Base Sepolia  
      // 3. Retry the request with payment proof
      const response = await apiClient.post("/api/v1/vms", request)
      
      console.log("✅ VM created successfully:", response.data)
      return {
        success: true,
        vmId: response.data.vm_id || response.data.vmId || response.data.id,
      }
    } catch (error: any) {
      console.error("❌ VM creation failed:", error)
      
      // Handle specific errors
      if (error.response?.status === 402) {
        return {
          success: false,
          error: "Payment required: 0.5 USDC on Base Sepolia. Please ensure sufficient wallet balance."
        }
      }
      
      if (error.message?.includes("insufficient")) {
        return {
          success: false,
          error: "Insufficient USDC balance. You need 0.5 USDC to access this model."
        }
      }

      if (error.message?.includes("User rejected")) {
        return {
          success: false,
          error: "Payment cancelled. Please approve the 0.5 USDC transaction to continue."
        }
      }
      
      return {
        success: false,
        error: error.message || "Failed to create VM"
      }
    }
  }
}
