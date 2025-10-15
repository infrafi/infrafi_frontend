# Frontend Configuration Update - OORT Testnet

## 🎯 Overview

Updated InfraFi frontend to connect to **OORT Testnet** with the latest contract deployment including revenue sharing and vault-level node type architecture.

## 📝 Changes Made

### 1. **Network Configuration** (`src/config/contracts.ts`)

**Updated Network:**
```typescript
OORT_NETWORK = {
  name: 'OORT Testnet',      // Changed from 'OORT Mainnet'
  chainId: 9700,              // Changed from 970
  rpcUrl: 'https://dev-rpc.oortech.com',
  explorer: 'https://dev-scan.oortech.com',
}
```

### 2. **Contract Addresses**

Updated all contract addresses to testnet deployment:

| Contract | Address |
|----------|---------|
| **NodeVaultUpgradeable** | `0x484407CE57245A96782E1d28a81d1536DAAE0176` |
| **WOORT** | `0x0809f1dC272F42F96F0B06cE5fFCEC97cB9FA82d` |
| **ProtocolAdapterRegistry** | `0x08Ebce0AAcd684b5eeD117A5752D404063EA5438` |
| **NodeProxyManager** | `0x537A5e44934119dcD26FA9A18bFfE9daCc6100C8` |
| **OortProtocolAdapter** | `0x241D931d6A8503E0176cfD1239237771498Fa0c4` |
| **OortNodeContract** | `0xA97E5185DC116588A85197f446Aa87cE558d254C` |

### 3. **Protocol Parameters**

Updated to match testnet configuration:

```typescript
PROTOCOL_PARAMS = {
  maxLTVPercent: 80,           // 80% LTV (testnet)
  liquidationThreshold: 80,    // 80% threshold
  interestRateModel: {
    baseRate: 300,             // 3% base rate
    multiplier: 800,           // 8% multiplier
    jump: 5000,                // 50% jump rate
    kink: 8000,                // 80% kink
  },
  revenueSharing: {            // ✨ NEW
    deployerShare: 15,         // 15% to adapter deployer
    protocolShare: 5,          // 5% to protocol reserves
    lenderShare: 80,           // 80% to lenders
  },
}
```

### 4. **Updated ABIs**

#### **NodeVault ABI Changes:**

**Added Functions:**
- `getTotalDebt()` - Get total outstanding debt
- `vaultNodeType()` - Get vault's node type
- `maxLTV()` - Get max loan-to-value ratio
- `getBorrowerPosition()` - Get complete borrower position
- `getAvailableProxy()` - Check proxy availability
- `createProxyForProtocol()` - Create new proxy
- `deployerSharePercentage()` - Get deployer share %
- `protocolSharePercentage()` - Get protocol share %
- `protocolReserves()` - Get protocol reserves
- `getDeployerRewards()` - Get deployer rewards

**Updated Functions:**
- `depositNodes(uint256[] nodeIds)` - ⚠️ Removed `nodeTypes` parameter (vault-level nodeType)
- `withdrawNodes(uint256[] nodeIds)` - ⚠️ Removed `nodeTypes` parameter
- `getLenderPosition()` - Updated return tuple structure
- Removed `getUserPosition()` - Replaced with `getBorrowerPosition()`
- Removed `getTotalBorrowed()` - Use `getBorrowerPosition()` instead
- Removed `getTotalDebt(address)` - Use `getBorrowerPosition()` instead

**Added Events:**
- `ProxyCreatedForDeposit` - Emitted when proxy is created

#### **NodeProxyManager ABI:**

```typescript
// Updated functions
'function getProtocolProxies(uint256 protocolType) returns (address[])',
'function findAvailableProxy(uint256 protocolType) returns (address, bool)',
'function createNewProxy(uint256 protocolType) returns (address)',
```

#### **Added Constant:**
```typescript
export const OORT_PROTOCOL_TYPE = 1;
```

## 🚀 Key Architecture Changes

### Vault-Level Node Type

The vault now operates with a **single node type** per vault instance:
- Each vault is dedicated to one protocol (e.g., OORT, Helium, Filecoin)
- No need to pass `nodeTypes` array when depositing/withdrawing
- Simplifies frontend logic and reduces gas costs

**Before:**
```typescript
await vault.depositNodes([nodeId1, nodeId2], [1, 1]); // nodeTypes array
```

**After:**
```typescript
await vault.depositNodes([nodeId1, nodeId2]); // No nodeTypes needed
```

### Revenue Sharing System

New revenue distribution on interest payments:
- **15%** → Adapter deployer (claimable rewards)
- **5%** → Protocol reserves (vault owner)
- **80%** → Lenders (distributed proportionally)

## 🔧 Frontend Components Affected

The following components will need updates:

### ✅ No Changes Needed:
- `Header.tsx` - Uses network config (auto-updated)
- `ProtocolStats.tsx` - Uses updated ABIs
- `SupplyWithdraw.tsx` - Lender functions unchanged
- `BorrowRepay.tsx` - Borrow/repay unchanged

### ⚠️ Requires Updates:
- `NodeManagement.tsx` - Remove `nodeTypes` parameter from deposit/withdraw calls
- `UserPosition.tsx` - Update to use `getBorrowerPosition()` instead of old functions
- `Dashboard.tsx` - May need updates if displaying revenue sharing info

## 📊 New Features Available

### 1. Revenue Sharing Display
```typescript
const deployerShare = await vault.deployerSharePercentage(); // 15
const protocolShare = await vault.protocolSharePercentage(); // 5
const reserves = await vault.protocolReserves();
const deployerRewards = await vault.getDeployerRewards(deployerAddress);
```

### 2. Proxy Management
```typescript
const [proxyAddress, needsNewProxy] = await vault.getAvailableProxy(OORT_PROTOCOL_TYPE);
if (needsNewProxy) {
  const newProxy = await vault.createProxyForProtocol(OORT_PROTOCOL_TYPE);
}
```

### 3. Enhanced Position Info
```typescript
const position = await vault.getBorrowerPosition(userAddress);
// Returns: { totalBorrowed, accruedInterest, lastBorrowTime, borrowIndexCheckpoint, depositedNodes[] }
```

## 🧪 Testing Checklist

Before deploying the updated frontend:

- [ ] Test wallet connection to OORT Testnet (ChainID 9700)
- [ ] Verify contract addresses match testnet deployment
- [ ] Test node discovery (getOwnerNodeList)
- [ ] Test node deposit (without nodeTypes parameter)
- [ ] Test borrowing functionality
- [ ] Test repayment
- [ ] Test node withdrawal (without nodeTypes parameter)
- [ ] Test lender supply/withdraw
- [ ] Verify APY calculations display correctly
- [ ] Test proxy creation when needed
- [ ] Display revenue sharing information

## 🔗 Related Documentation

- **Contract Deployment:** `infrafi_contracts/deployments/oort-testnet-addresses.env`
- **Vault Status Script:** `infrafi_contracts/scripts/vault-status.js`
- **Integration Tests:** `infrafi_contracts/test/integration-testnet-advanced.test.js`
- **Contract Source:** `infrafi_contracts/contracts/NodeVaultUpgradeable.sol`

## 🌐 MetaMask Setup

Users need to add OORT Testnet to MetaMask:

```
Network Name: OORT Testnet
RPC URL: https://dev-rpc.oortech.com
Chain ID: 9700
Currency Symbol: OORT
Block Explorer: https://dev-scan.oortech.com
```

The frontend will automatically prompt users to add/switch networks when connecting wallet.

## 🎯 Next Steps

1. **Update Components:** Modify `NodeManagement.tsx` and `UserPosition.tsx` to use new ABIs
2. **Add Revenue Display:** Show deployer/protocol/lender revenue split
3. **Test Thoroughly:** Run full integration tests on testnet
4. **Update UI:** Consider adding testnet indicator/banner
5. **Documentation:** Update user guide with testnet instructions

## ✅ Verification

Configuration updated successfully:
- ✅ Network: OORT Testnet (ChainID 9700)
- ✅ Contract addresses: Latest testnet deployment
- ✅ ABIs: Updated for vault-level nodeType
- ✅ Protocol params: Matches testnet configuration
- ✅ No TypeScript errors

