export const POLYGON_AMOY_CHAIN_ID = 80002
export const BASE_SEPOLIA_CHAIN_ID = 84532

export interface ChainInfo {
  chainId: number
  name: string
  currency: string
  rpcUrl: string
  blockExplorer: string
}

export const POLYGON_AMOY: ChainInfo = {
  chainId: POLYGON_AMOY_CHAIN_ID,
  name: "Polygon Amoy",
  currency: "POL",
  rpcUrl: "https://polygon-amoy.g.alchemy.com/v2/MfgwMxE_nilnusAamn_chUxACP0N8o1C",
  blockExplorer: "https://www.oklink.com/amoy",
}

export const BASE_SEPOLIA: ChainInfo = {
  chainId: BASE_SEPOLIA_CHAIN_ID,
  name: "Base Sepolia",
  currency: "ETH",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
}

export function isPolygonNetwork(chainId: number): boolean {
  return chainId === POLYGON_AMOY_CHAIN_ID
}

export function isBaseSepoliaNetwork(chainId: number): boolean {
  return chainId === BASE_SEPOLIA_CHAIN_ID
}

export function isSupportedNetwork(chainId: number): boolean {
  return isPolygonNetwork(chainId) || isBaseSepoliaNetwork(chainId)
}

export function getChainInfo(chainId: number): ChainInfo | null {
  switch (chainId) {
    case POLYGON_AMOY_CHAIN_ID:
      return POLYGON_AMOY
    case BASE_SEPOLIA_CHAIN_ID:
      return BASE_SEPOLIA
    default:
      return null
  }
}

export function getAllSupportedChains(): ChainInfo[] {
  return [POLYGON_AMOY, BASE_SEPOLIA]
}

export function getNetworkDisplayName(chainId: number): string {
  const chainInfo = getChainInfo(chainId)
  return chainInfo ? chainInfo.name : `Unknown Network (${chainId})`
}

// Helper function to format network info for MetaMask
export function getMetaMaskNetworkConfig(chainId: number) {
  const chainInfo = getChainInfo(chainId)
  if (!chainInfo) return null

  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: chainInfo.name,
    nativeCurrency: {
      name: chainInfo.currency,
      symbol: chainInfo.currency,
      decimals: 18,
    },
    rpcUrls: [chainInfo.rpcUrl],
    blockExplorerUrls: [chainInfo.blockExplorer],
  }
}
