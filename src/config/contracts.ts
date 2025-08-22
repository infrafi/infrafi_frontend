// Contract addresses and configuration for InfraFi protocol
export const CONTRACT_ADDRESSES = {
  NodeVaultUpgradeable: '0x02E999d822cAE0b41662e395762B819d46B91ABA',
  WOORT: '0xEAd29460881f38ADA079A38ac3D82E2D088930d9',
  ProtocolAdapterRegistry: '0x1C301BdCD6b22267Dee380D58840dFc219E03BF1',
  NodeProxyManager: '0xca0d310D20E2Acd4cAed1ce7186998C8400Af55d',
  OortProtocolAdapter: '0x64eB4C1e1d99Ef8294FFF110441c50d3edEd2492',
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

// Correct ABIs from the deployed contract (checked against NodeVaultUpgradeable.sol)
export const NODE_VAULT_ABI = [
  // Core statistics functions  
  'function getTotalSupplied() external view returns (uint256)',
  'function getUtilizationRate() external view returns (uint256)',
  'function getCurrentBorrowAPY() external view returns (uint256)',
  'function getCurrentSupplyAPY() external view returns (uint256)',
  
  // User action functions
  'function supply(uint256 amount) external',
  'function withdraw(uint256 amount) external', 
  'function borrow(uint256 amount) external',
  'function repay(uint256 amount) external',
  
  // User position functions (corrected names from contract)
  'function getLenderPosition(address lender) external view returns (uint256 totalSupplied, uint256 accruedInterest, uint256 lastSupplyTime)',
  'function getTotalBorrowed(address user) external view returns (uint256)',
  'function getTotalDebt(address user) external view returns (uint256)',
  'function getMaxBorrowAmount(address user) external view returns (uint256)',
  
  // Node functions
  'function getNodeInfo(uint256 nodeId, uint256 nodeType) external view returns (uint256 nodeIdOut, uint256 nodeTypeOut, address depositor, uint256 depositTime, uint256 assetValue, address nodeProtocolContract, bool inVault)',
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
