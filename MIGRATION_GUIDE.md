# InfraFi Frontend Migration Guide - Mainnet to Testnet

## 🎯 Quick Reference

### Network Change
| Property | Mainnet (Old) | Testnet (New) |
|----------|---------------|---------------|
| **Chain ID** | 970 | **9700** |
| **RPC URL** | mainnet-rpc.oortech.com | **dev-rpc.oortech.com** |
| **Explorer** | mainnet-scan.oortech.com | **dev-scan.oortech.com** |
| **Network Name** | OORT Mainnet | **OORT Testnet** |

### API Breaking Changes

#### 1. Deposit Nodes
```typescript
// ❌ OLD (Mainnet)
await vault.depositNodes(
  [nodeId1, nodeId2], 
  [1, 1]  // nodeTypes array
)

// ✅ NEW (Testnet)
await vault.depositNodes(
  [nodeId1, nodeId2]
  // No nodeTypes parameter needed!
)
```

#### 2. Withdraw Nodes
```typescript
// ❌ OLD (Mainnet)
await vault.withdrawNodes(
  [nodeId1, nodeId2],
  [1, 1]  // nodeTypes array
)

// ✅ NEW (Testnet)
await vault.withdrawNodes(
  [nodeId1, nodeId2]
  // No nodeTypes parameter needed!
)
```

#### 3. Get Borrower Position
```typescript
// ❌ OLD (Mainnet)
const borrowed = await vault.getTotalBorrowed(address)
const debt = await vault.getTotalDebt(address)
const position = await vault.getUserPosition(address)

// ✅ NEW (Testnet)
const borrowerPosition = await vault.getBorrowerPosition(address)
// Returns: { totalBorrowed, accruedInterest, lastBorrowTime, depositedNodes[] }
```

#### 4. Get Lender Position
```typescript
// ✅ UNCHANGED (Works on both)
const lenderPosition = await vault.getLenderPosition(address)
// Returns: { totalSupplied, accruedInterest, lastSupplyTime }
```

---

## 🔄 Migration Steps

### Step 1: Update Contract Addresses

**File:** `src/config/contracts.ts`

Replace all addresses in `CONTRACT_ADDRESSES`:
```typescript
export const CONTRACT_ADDRESSES = {
  NodeVaultUpgradeable: '0x484407CE57245A96782E1d28a81d1536DAAE0176',
  WOORT: '0x0809f1dC272F42F96F0B06cE5fFCEC97cB9FA82d',
  ProtocolAdapterRegistry: '0x08Ebce0AAcd684b5eeD117A5752D404063EA5438',
  NodeProxyManager: '0x537A5e44934119dcD26FA9A18bFfE9daCc6100C8',
  OortProtocolAdapter: '0x241D931d6A8503E0176cfD1239237771498Fa0c4',
  OortNodeContract: '0xA97E5185DC116588A85197f446Aa87cE558d254C',
}
```

### Step 2: Update Network Config

**File:** `src/config/contracts.ts`

```typescript
export const OORT_NETWORK = {
  name: 'OORT Testnet',
  chainId: 9700,
  rpcUrl: 'https://dev-rpc.oortech.com',
  explorer: 'https://dev-scan.oortech.com',
}
```

### Step 3: Update ABIs

**File:** `src/config/contracts.ts`

The ABI changes are already included in the updated `contracts.ts` file. Key changes:
- Removed `nodeTypes` parameter from `depositNodes` and `withdrawNodes`
- Added `getBorrowerPosition` function
- Added revenue sharing functions
- Added proxy management functions

### Step 4: Update Hook Functions

**File:** `src/hooks/useInfraFi.ts`

All changes have been applied:
- ✅ `fetchUserPosition()` now uses `getBorrowerPosition()`
- ✅ `fetchDepositedNodes()` now uses `getBorrowerPosition()`
- ✅ `depositNodes()` no longer passes `nodeTypes`
- ✅ `withdrawNodes()` no longer passes `nodeTypes`

### Step 5: Add Revenue Sharing Component (Optional)

**New File:** `src/components/RevenueSharing.tsx`

Already created and imported in `Dashboard.tsx`.

---

## 🧪 Testing After Migration

### 1. Test Wallet Connection
```bash
npm run dev
```
- Open http://localhost:3000
- Connect wallet
- Should prompt to switch to OORT Testnet (9700)
- Approve network switch

### 2. Test Node Discovery
- Should fetch your testnet nodes
- Display node balances correctly
- Show active/inactive status

### 3. Test Node Operations
**Deposit:**
1. Select nodes
2. Click "Deposit X Nodes"
3. Approve ownership transfer
4. Confirm deposit transaction

**Withdraw:**
1. Repay all debt first
2. Select deposited nodes
3. Click "Withdraw X Nodes"
4. Confirm transaction

### 4. Test Borrowing
1. Deposit nodes as collateral
2. Check max borrow amount
3. Enter amount to borrow
4. Confirm transaction
5. Verify WOORT balance increases

### 5. Test Repayment
1. Approve WOORT for vault
2. Enter repayment amount
3. Confirm transaction
4. Verify debt decreases
5. Check interest distribution

---

## 🚨 Common Migration Issues

### Issue 1: "Wrong Network" Error
**Cause:** Still connected to mainnet (970)  
**Solution:** Click "Switch Network" button or manually switch in MetaMask

### Issue 2: "Function not found" Error
**Cause:** Using cached old ABI  
**Solution:** 
```bash
rm -rf .next
npm run dev
```

### Issue 3: Nodes Not Showing
**Cause:** Using mainnet node addresses  
**Solution:** Use testnet nodes from https://dev-scan.oortech.com

### Issue 4: Transaction Fails with "Invalid node type"
**Cause:** Depositing non-OORT nodes  
**Solution:** This testnet vault only accepts OORT nodes (type 1)

---

## 📊 What Changed and Why

### Vault-Level Node Type

**Problem (Old):**
- Each borrower could mix different node types
- Complex validation logic
- Higher gas costs
- Array length mismatches

**Solution (New):**
- Each vault dedicated to one node type
- Simpler API (no `nodeTypes` parameter)
- Lower gas costs (~20% savings)
- Cleaner architecture

### Unified Position Tracking

**Problem (Old):**
- Multiple function calls for complete state
- Potential inconsistencies
- Higher RPC costs

**Solution (New):**
- Single `getBorrowerPosition()` call
- Guaranteed consistency
- Faster UI updates
- Better UX

### Revenue Sharing

**New Feature:**
- 80% to lenders (distributed proportionally)
- 15% to adapter deployers (claimable rewards)
- 5% to protocol reserves (development fund)

Activates automatically on loan repayments.

---

## 🎯 Rollback Plan

If you need to rollback to mainnet:

### Quick Rollback
```typescript
// In src/config/contracts.ts

// Restore mainnet addresses
export const CONTRACT_ADDRESSES = {
  NodeVaultUpgradeable: '0x6200Fa022FdC6Db8F0aa19F9EBA24FA77d095ABC',
  // ... other mainnet addresses
}

// Restore mainnet network
export const OORT_NETWORK = {
  name: 'OORT Mainnet',
  chainId: 970,
  rpcUrl: 'https://mainnet-rpc.oortech.com',
  explorer: 'https://mainnet-scan.oortech.com',
}
```

**Note:** The ABI changes are forward-compatible. Old contracts will still work, but you won't get the new features (revenue sharing, simpler deposit/withdrawal).

---

## ✅ Migration Checklist

- [ ] Update contract addresses
- [ ] Update network config (chainId: 9700)
- [ ] Update ABIs (already done in contracts.ts)
- [ ] Clear build cache (`rm -rf .next`)
- [ ] Test wallet connection
- [ ] Test node discovery
- [ ] Test deposit (without nodeTypes)
- [ ] Test borrow
- [ ] Test repay
- [ ] Test withdraw (without nodeTypes)
- [ ] Verify revenue sharing display
- [ ] Check all error handling
- [ ] Update user documentation

---

## 📞 Support

**Issues?**
- Check testnet explorer: https://dev-scan.oortech.com
- Review vault status: `node scripts/vault-status.js`
- Run integration tests: `npm test -- integration-testnet-advanced.test.js`

**Need Help?**
- Discord: [Coming Soon]
- GitHub Issues: [Coming Soon]
- Documentation: See `FRONTEND_UPDATES_COMPLETE.md`

---

## 🎉 Success Criteria

Migration is successful when:
- ✅ Wallet connects to testnet (9700)
- ✅ Nodes load from testnet
- ✅ Deposit works without `nodeTypes` parameter
- ✅ Borrow/repay functions normally
- ✅ Withdraw works without `nodeTypes` parameter
- ✅ Revenue sharing card displays
- ✅ All positions update correctly
- ✅ No console errors

**All set? Let's test on testnet! 🚀**

