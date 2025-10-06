# InfraFi Frontend - Testing Guide

## ✅ Build Status: SUCCESS

**Server Status:** ✅ Running on http://localhost:3000

### Build Results
```
✓ Compiled successfully in 5.5s
✓ Linting and checking validity of types
✓ Generating static pages (4/4)
✓ No TypeScript errors
✓ No build warnings
```

---

## 🌐 Quick Start

### 1. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Add OORT Testnet to MetaMask

**Method 1: Automatic (Recommended)**
- Click "Connect Wallet" button
- MetaMask will prompt to add/switch networks
- Approve the network addition

**Method 2: Manual**
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network" → "Add a network manually"
4. Enter the following:
   - **Network Name:** OORT Testnet
   - **RPC URL:** https://dev-rpc.oortech.com
   - **Chain ID:** 9700
   - **Currency Symbol:** OORT
   - **Block Explorer:** https://dev-scan.oortech.com
5. Click "Save"

---

## 🧪 Testing Checklist

### ✅ Visual Inspection

Open http://localhost:3000 and verify:

- [ ] **Header displays correctly**
  - InfraFi logo visible
  - "Connect Wallet" button present
  
- [ ] **Protocol Overview section shows:**
  - Total Supplied (0 WOORT initially)
  - Total Borrowed (0 WOORT initially)
  - Supply APY (-.-%  initially)
  - Utilization (-.-%  initially)
  
- [ ] **Revenue Sharing section displays:**
  - 🟢 Lenders: 80%
  - 🔵 Deployers: 15%
  - 🟣 Protocol: 5%
  - Clear descriptions for each stakeholder
  
- [ ] **"Connect your wallet" message visible**

### ✅ Wallet Connection

- [ ] **Click "Connect Wallet"**
  - MetaMask popup appears
  - Request to connect account
  
- [ ] **Approve connection**
  - Network switch prompt (if not on testnet)
  - Account connected successfully
  
- [ ] **Verify wallet display**
  - Address shown in header
  - "Disconnect" option available

### ✅ Protocol Stats (After Connection)

Once connected and on correct network:

- [ ] **Protocol stats load**
  - Real values appear (not "0" or "-.-%")
  - No console errors
  
- [ ] **User position displays**
  - WOORT Balance card
  - Supplied amount card
  - Borrowed amount card
  - Health factor shown

### ✅ Node Discovery

- [ ] **"My Nodes" section appears**
  - Shows "Available Nodes" section
  - Shows "Deposited Nodes" section
  
- [ ] **Available nodes load**
  - Your testnet nodes display
  - Node details show:
    - Node address
    - Total Balance (pledge + rewards)
    - Original Pledge
    - Earned Rewards
    - Locked Rewards
    - Active/Inactive status
  
- [ ] **Refresh buttons work**
  - "Refresh Available" updates node list
  - "Refresh Deposited" updates deposited list

### ✅ Node Deposit Flow

- [ ] **Select nodes to deposit**
  - Click checkboxes on available nodes
  - "Select All" button works
  - Selected count updates
  
- [ ] **Deposit transaction**
  - Click "Deposit X Nodes" button
  - MetaMask approves:
    1. Transfer ownership (changeOwner)
    2. Deposit as collateral
  - Success: nodes move to "Deposited" section
  - Error handling displays if fails

### ✅ Borrowing Flow

- [ ] **Supply/Borrow section displays**
  - Shows max borrow amount
  - Input field for borrow amount
  - Borrow APY visible
  
- [ ] **Borrow transaction**
  - Enter amount to borrow
  - Click "Borrow" button
  - MetaMask approval
  - Success: WOORT balance increases
  - Borrowed amount updates

### ✅ Repayment Flow

- [ ] **Repay section shows**
  - Current borrowed amount
  - Accrued interest
  - Total debt
  - Input field for repayment
  
- [ ] **Repay transaction**
  - Enter repayment amount
  - Click "Repay" button
  - MetaMask approvals:
    1. Approve WOORT for vault
    2. Repay transaction
  - Success: debt decreases
  - Revenue sharing occurs automatically

### ✅ Node Withdrawal Flow

- [ ] **After full repayment**
  - Select deposited nodes
  - Click "Withdraw X Nodes"
  - MetaMask approval
  - Success: nodes return to "Available"

### ✅ Lender Flow

- [ ] **Supply WOORT**
  - Enter amount to supply
  - Click "Supply" button
  - MetaMask approvals
  - Supplied amount increases
  
- [ ] **Withdraw WOORT**
  - Enter amount to withdraw
  - Click "Withdraw" button
  - MetaMask approval
  - Withdrawal includes principal + interest

---

## 🔍 Browser Console Checks

Open browser DevTools (F12) and check Console tab:

### Expected Logs (Good Signs)
```
✅ Initializing contracts...
✅ Contracts created: { nodeVault: true, woort: true, oortNode: true, proxyManager: true }
✅ Contracts set in state
✅ getTotalSupplied(): [value]
✅ getUtilizationRate(): [value]
✅ getCurrentBorrowAPY(): [value]
✅ getCurrentSupplyAPY(): [value]
✅ WOORT balanceOf(): [value]
✅ getLenderPosition(): { totalSupplied: [value] }
✅ getBorrowerPosition(): { totalBorrowed: [value], accruedInterest: [value] }
🔍 Fetching node addresses...
📋 Found X node addresses
✅ Successfully fetched X nodes
```

### ⚠️ Watch Out For
```
❌ Function not found errors
❌ Network mismatch errors  
❌ Contract address errors
❌ ABI mismatch errors
❌ Transaction reverts
```

---

## 🧪 Advanced Testing

### Test Revenue Sharing

1. **Setup:**
   - Supply WOORT as lender
   - Deposit nodes as borrower
   - Borrow WOORT
   
2. **Accrue Interest:**
   - Wait or advance time
   - Interest accumulates
   
3. **Repay with Interest:**
   - Repay loan with interest
   - Check deployer rewards increase
   - Check protocol reserves increase
   - Check lender position includes interest

4. **Verify Split:**
   - Deployer should get ~15% of interest
   - Protocol should get ~5% of interest
   - Lender should get ~80% of interest

### Test Proxy Management

1. **Check proxy availability:**
   ```javascript
   const [proxy, needsNew] = await vault.getAvailableProxy(1)
   console.log('Proxy:', proxy, 'Needs new:', needsNew)
   ```

2. **Create proxy if needed:**
   ```javascript
   if (needsNew) {
     await vault.createProxyForProtocol(1)
   }
   ```

### Test Edge Cases

- [ ] Try to borrow more than max LTV
- [ ] Try to withdraw nodes with outstanding debt
- [ ] Try to deposit invalid nodes
- [ ] Test with 0 balance
- [ ] Test with maximum values

---

## 📊 Success Criteria

### Minimum Viable Test (MVP)
- ✅ Page loads without errors
- ✅ Wallet connects successfully
- ✅ Revenue sharing card displays
- ✅ Nodes can be discovered
- ✅ Basic deposit/borrow/repay/withdraw flow works

### Full Integration Test
- ✅ All MVP criteria
- ✅ Interest accrual visible
- ✅ Revenue sharing distributes correctly
- ✅ Multiple nodes can be managed
- ✅ Lender can supply and withdraw with interest
- ✅ No console errors throughout flow
- ✅ UI updates in real-time

---

## 🐛 Troubleshooting

### Issue: "Connect Wallet" does nothing
**Solution:** Ensure MetaMask is installed and unlocked

### Issue: Wrong network error
**Solution:** Click "Switch Network" or manually change to OORT Testnet (9700)

### Issue: Nodes not loading
**Solutions:**
1. Check you're on OORT Testnet
2. Verify you have nodes on testnet (not mainnet)
3. Click "Refresh Available" button
4. Check console for errors

### Issue: Transaction fails
**Solutions:**
1. Check you have enough OORT for gas
2. Ensure allowances are approved
3. Verify you're not exceeding max LTV
4. Check node ownership is correct

### Issue: Values not updating
**Solutions:**
1. Wait a few seconds for blockchain confirmation
2. Click refresh buttons
3. Clear cache: `rm -rf .next && npm run dev`

### Issue: Console errors about functions
**Solution:** This likely means ABI mismatch - verify contracts.ts is updated

---

## 📞 Getting Help

### Check Deployment
```bash
cd ../infrafi_contracts
node scripts/vault-status.js
```

### Run Integration Tests
```bash
cd ../infrafi_contracts
npm test -- integration-testnet-advanced.test.js
```

### View Testnet Transactions
- Explorer: https://dev-scan.oortech.com
- Search your wallet address
- View transaction history

---

## ✨ Demo Flow (Recommended)

For a complete demo, follow this sequence:

### 1. Setup (1 min)
- Open http://localhost:3000
- Connect wallet
- Switch to OORT Testnet

### 2. Explore (2 min)
- View protocol stats
- See revenue sharing model
- Check your WOORT balance
- Discover your nodes

### 3. Lender Flow (2 min)
- Supply WOORT to vault
- View supply APY
- Check your supplied position

### 4. Borrower Flow (5 min)
- Select nodes to deposit
- Deposit as collateral
- Check max borrow amount
- Borrow WOORT
- View borrowed position
- Wait for interest to accrue
- Repay with interest (revenue sharing activates)
- Withdraw nodes

### 5. Verify (1 min)
- Check final balances
- Confirm nodes returned
- View protocol stats updated

**Total Demo Time: ~11 minutes**

---

## 🎉 Success!

If you can complete the demo flow without errors:

✅ **Frontend is working perfectly!**
✅ **Smart contracts are functioning!**
✅ **Revenue sharing is active!**
✅ **Ready for production deployment!**

---

## 📝 Notes

- **Network:** OORT Testnet (ChainID 9700)
- **Node Type:** OORT nodes only (type 1)
- **LTV:** 80% maximum
- **Revenue Split:** 80% lenders / 15% deployers / 5% protocol

**Server running at:** http://localhost:3000

**Have fun testing! 🚀**

