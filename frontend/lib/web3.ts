import { createConfig, http } from "wagmi"
import { polygon, polygonMumbai } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id"

export const config = createConfig({
  chains: [polygon, polygonMumbai],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
})

export const SUPPORTED_CHAINS = [polygon.id, polygonMumbai.id]

export function isSupportedChain(chainId: number): boolean {
  return SUPPORTED_CHAINS.includes(chainId)
}

export function getChainName(chainId: number): string {
  switch (chainId) {
    case polygon.id:
      return "Polygon"
    case polygonMumbai.id:
      return "Polygon Mumbai"
    default:
      return "Unknown Network"
  }
}

export function getExplorerUrl(chainId: number): string {
  switch (chainId) {
    case polygon.id:
      return "https://polygonscan.com"
    case polygonMumbai.id:
      return "https://mumbai.polygonscan.com"
    default:
      return ""
  }
}
