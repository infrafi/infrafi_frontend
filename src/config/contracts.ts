// Contract addresses and configuration for InfraFi protocol
export const CONTRACT_ADDRESSES = {
  NodeVaultUpgradeable: '0x742d35cc6634c0532925A3b8d557A2aBC7f8C4C2',
  WOORT: '0xEAd29460881f38ADA079A38ac3D82E2D088930d9',
  ProtocolAdapterRegistry: '0x031d35296154c60CAb3a9fC6f26E72975E3c4C19',
  NodeProxyManager: '0xde3c9a7AD84f7aCFFCf6Dc2f4b9a1314D6f87FF2',
  OortProtocolAdapter: '0x5c7fe1c31f6F7e0F2C9E4234b6F0e4B2f4B3b3b3',
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
  // Correct ABI from the test script - getOwnerNodeList returns ADDRESSES, not IDs
  'function getOwnerNodeList(address owner) external view returns (address[])',
  'function nodeDataInfo(address nodeAddress) external view returns (tuple(address ownerAddress, address nodeAddress, uint256 pledge, uint256 maxPledge, uint256 endTime, uint256 lockedRewards, uint256 balance, uint256 nodeType, uint256 lockTime, uint256 totalRewards, bool nodeStatus))',
] as const;
