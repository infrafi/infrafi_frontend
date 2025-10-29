// Contract addresses and configuration for InfraFi protocol
// 🚀 UPDATED: October 29, 2025 - OORT Testnet Redeployment (Latest)
export const CONTRACT_ADDRESSES = {
  NodeVaultUpgradeable: '0xdE642341Fc61E92bfbae7f2299C24651ceF087Cf', // ✅ Testnet: Latest deployment - With revenue sharing (15/5/80)
  WOORT: '0x0809f1dC272F42F96F0B06cE5fFCEC97cB9FA82d',
  ProtocolAdapterRegistry: '0x66756b707B888e02DE08f373183AF08ED5803F18', // ✅ Testnet: Latest deployment - With deployer tracking
  NodeProxyManager: '0x5bC1666b5EDDbC6487310C27F6fBbF1E53ad4739', // ✅ Testnet: Latest deployment - Proxy manager
  OortProtocolAdapter: '0x0E7219a485555fD34e1538f5a859b20cf15d6f3A', // ✅ Testnet: Latest deployment - OORT adapter
  OortNodeContract: '0xA97E5185DC116588A85197f446Aa87cE558d254C', // ✅ Testnet: OORT node contract
} as const;

export const OORT_NETWORK = {
  name: 'OORT Testnet',
  chainId: 9700,
  rpcUrl: 'https://dev-rpc.oortech.com',
  explorer: 'https://dev-scan.oortech.com',
} as const;

export const PROTOCOL_PARAMS = {
  // 🛡️ TESTNET DEPLOYMENT PARAMETERS - Block 893295 configuration
  maxLTVPercent: 80, // 80% max LTV (testnet-friendly for easier testing)
  liquidationThreshold: 80, // 80% liquidation threshold
  interestRateModel: {
    baseRate: 300, // 3% base rate (in basis points)
    multiplier: 800, // 8% multiplier (in basis points)
    jump: 5000, // 50% jump rate (in basis points)
    kink: 8000, // 80% utilization kink (in basis points)
  },
  revenueSharing: {
    deployerShare: 15, // 15% to adapter deployer
    protocolShare: 5,  // 5% to protocol reserves
    lenderShare: 80,   // 80% to lenders
  },
} as const;

// ✅ Updated ABIs matching current testnet deployment (vault-level nodeType)
export const NODE_VAULT_ABI = [
  // Core statistics functions  
  'function getTotalSupplied() external view returns (uint256)',
  'function getTotalDebt() external view returns (uint256)',
  'function getUtilizationRate() external view returns (uint256)',
  'function getCurrentBorrowAPY() external view returns (uint256)',
  'function getCurrentSupplyAPY() external view returns (uint256)',
  'function vaultNodeType() external view returns (uint256)',
  'function maxLTV() external view returns (uint256)',
  
  // Public state variables for calculating borrowed principal
  'function totalLent() external view returns (uint256)',
  'function totalRepaid() external view returns (uint256)',
  
  // User action functions
  'function supply(uint256 amount) external',
  'function withdraw(uint256 amount) external', 
  'function borrow(uint256 amount) external',
  'function repay(uint256 amount) external',
  
  // User position functions
  'function getLenderPosition(address lender) external view returns (tuple(uint256 totalSupplied, uint256 accruedInterest, uint256 lastSupplyTime, uint256 supplyIndexCheckpoint) position)',
  'function getBorrowerPosition(address user) external view returns (tuple(uint256 totalBorrowed, uint256 accruedInterest, uint256 lastBorrowTime, uint256 borrowIndexCheckpoint, tuple(uint256 nodeId, uint256 nodeType)[] depositedNodes) position)',
  'function getMaxBorrowAmount(address user) external view returns (uint256)',
  
  // Node functions (updated: no nodeTypes array parameter)
  'function getNodeInfo(uint256 nodeId, uint256 nodeType) external view returns (uint256 nodeIdOut, uint256 nodeTypeOut, address depositor, uint256 depositTime, uint256 assetValue, address nodeProtocolContract, bool inVault)',
  'function depositNodes(uint256[] calldata nodeIds) external',
  'function withdrawNodes(uint256[] calldata nodeIds) external',
  
  // Proxy management
  'function getAvailableProxy(uint256 nodeType) external view returns (address proxyAddress, bool needsNewProxy)',
  'function createProxyForProtocol(uint256 nodeType) external returns (address proxyAddress)',
  
  // Revenue sharing
  'function deployerSharePercentage() external view returns (uint256)',
  'function protocolSharePercentage() external view returns (uint256)',
  'function protocolReserves() external view returns (uint256)',
  'function getDeployerRewards(address deployer) external view returns (uint256)',
  
  // Events
  'event NodeDeposited(uint256 indexed nodeId, uint256 indexed nodeType, address indexed depositor, uint256 assetValue)',
  'event NodeWithdrawn(uint256 indexed nodeId, uint256 indexed nodeType, address indexed depositor, uint256 timestamp)',
  'event ProxyCreatedForDeposit(uint256 indexed nodeType, address indexed proxyAddress, uint256 timestamp)',
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
  'function nodeAvailableBalanceAndPledge(address node_address) external view returns (uint256 availableBalance, uint256 realPledge)',
  'function changeOwner(address newOwner, address[] nodeAddressList) external',
] as const;

export const NODE_PROXY_MANAGER_ABI = [
  'function getProtocolProxies(uint256 protocolType) external view returns (address[])',
  'function findAvailableProxy(uint256 protocolType) external view returns (address proxyAddress, bool hasCapacity)',
  'function createNewProxy(uint256 protocolType) external returns (address)',
] as const;

// OORT Protocol Type constant
export const OORT_PROTOCOL_TYPE = 1;
