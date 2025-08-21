// Contract addresses and configuration for InfraFi protocol
export const CONTRACT_ADDRESSES = {
  NodeVaultUpgradeable: '0x742d35Cc6634C0532925a3b8D557A2AbC7F8c4c2',
  WOORT: '0xEAd29460881f38ADA079A38ac3D82E2D088930d9',
  ProtocolAdapterRegistry: '0x031d35296154C60CaB3A9Fc6F26e72975e3c4c19',
  NodeProxyManager: '0xde3c9A7ad84f7aCFFCf6dc2F4b9a1314D6F87Ff2',
  OortProtocolAdapter: '0x5c7fE1c31f6F7e0F2C9E4234b6F0E4B2F4b3b3b3',
  OortNodeContract: '0xDE155823964816d6E67de8eA31DEf95D59aaE2Fb',
} as const;

export const OORT_NETWORK = {
  name: 'OORT Mainnet',
  chainId: 970,
  rpcUrl: 'https://mainnet-rpc.oortech.com',
  explorer: 'https://mainnet-scan.oortech.com',
} as const;

export const PROTOCOL_PARAMS = {
  maxLTVPercent: 80, // 80% max LTV
  liquidationThreshold: 85, // 85% liquidation threshold
  interestRateModel: {
    baseRate: 200, // 2% base rate (in basis points)
    multiplier: 800, // 8% multiplier (in basis points)
    jump: 10000, // 100% jump rate (in basis points)
    kink: 8000, // 80% utilization kink (in basis points)
  },
} as const;

// Simplified ABIs - only the functions we need
export const NODE_VAULT_ABI = [
  'function totalSupplied() external view returns (uint256)',
  'function getUtilizationRate() external view returns (uint256)',
  'function getCurrentBorrowAPY() external view returns (uint256)',
  'function getCurrentSupplyAPY() external view returns (uint256)',
  'function supply(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function borrow(uint256 amount) external',
  'function repay(uint256 amount) external',
  'function getUserSupplied(address user) external view returns (uint256)',
  'function getUserBorrowed(address user) external view returns (uint256)',
  'function getUserMaxBorrowAmount(address user) external view returns (uint256)',
] as const;

export const WOORT_ABI = [
  'function balanceOf(address owner) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
] as const;

export const OORT_NODE_ABI = [
  'function getOwnerNodeList(address owner) external view returns (uint256[])',
  'function getNodeInfo(uint256 nodeId) external view returns (tuple(address owner, uint256 stakedAmount, uint256 rewards, bool isActive))',
] as const;
