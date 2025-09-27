export const POLYGON_CHAIN_ID = 137
export const POLYGON_TESTNET_CHAIN_ID = 80001

export interface ChainInfo {
  chainId: number
  name: string
  currency: string
  rpcUrl: string
  blockExplorer: string
}

export const POLYGON_MAINNET: ChainInfo = {
  chainId: POLYGON_CHAIN_ID,
  name: "Polygon",
  currency: "POL",
  rpcUrl: "https://polygon-rpc.com",
  blockExplorer: "https://polygonscan.com",
}

export const POLYGON_TESTNET: ChainInfo = {
  chainId: POLYGON_TESTNET_CHAIN_ID,
  name: "Polygon Mumbai",
  currency: "POL",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  blockExplorer: "https://mumbai.polygonscan.com",
}

export function isPolygonNetwork(chainId: number): boolean {
  return chainId === POLYGON_CHAIN_ID || chainId === POLYGON_TESTNET_CHAIN_ID
}

export function getChainInfo(chainId: number): ChainInfo | null {
  switch (chainId) {
    case POLYGON_CHAIN_ID:
      return POLYGON_MAINNET
    case POLYGON_TESTNET_CHAIN_ID:
      return POLYGON_TESTNET
    default:
      return null
  }
}
