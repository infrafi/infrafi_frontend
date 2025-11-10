'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '@/contexts/Web3Context'
import { ProtocolStats, UserPosition, OortNode, TransactionState } from '@/types/contracts'
import { parseBalance } from '@/lib/utils'

export function useInfraFi() {
  const { wallet, contracts } = useWeb3()
  
  const [protocolStats, setProtocolStats] = useState<ProtocolStats | null>(null)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [userNodes, setUserNodes] = useState<OortNode[]>([])
  const [depositedNodes, setDepositedNodes] = useState<OortNode[]>([])
  const [txState, setTxState] = useState<TransactionState>({ isLoading: false, error: null, operation: null })
  
  const [isLoading, setIsLoading] = useState({
    protocolStats: false,
    userPosition: false,
    userNodes: false,
    depositedNodes: false,
  })

  // Fetch protocol statistics
  const fetchProtocolStats = useCallback(async () => {
    if (!contracts.nodeVault) return

    setIsLoading(prev => ({ ...prev, protocolStats: true }))
    
    // Use individual try-catch blocks for each function to handle missing methods gracefully
    let totalSupplied = BigInt(0)
    let totalDebt = BigInt(0)  // Total debt including interest
    let totalBorrowed = BigInt(0)  // Principal only (for interest calculation)
    let totalBorrowInterest = BigInt(0)
    let totalLenderInterest = BigInt(0)
    let utilizationRate = 0
    let borrowAPY = 0
    let supplyAPY = 300 // Default 3% APY (300 basis points)
    let maxLTV = 8000 // Default 80% (8000 basis points)
    let liquidationThreshold = 8000 // Default 80% (8000 basis points)
    let baseRatePerYear = 300 // Default 3% (300 basis points)
    let multiplierPerYear = 800 // Default 8% (800 basis points)
    let jumpMultiplierPerYear = 5000 // Default 50% (5000 basis points)
    let kink = 8000 // Default 80% (8000 basis points)
    let deployerSharePercentage = 15 // Default 15%
    let protocolSharePercentage = 5 // Default 5%
    
    try {
      totalSupplied = BigInt(await contracts.nodeVault.getTotalSupplied())
      console.log('✅ getTotalSupplied():', totalSupplied.toString())
    } catch (error) {
      console.warn('getTotalSupplied() function failed:', error)
    }

    try {
      // Get total debt (principal + interest)
      totalDebt = BigInt(await contracts.nodeVault.getTotalDebt())
      console.log('✅ getTotalDebt():', totalDebt.toString())
      
      // Get principal amounts (optional - for interest calculation)
      try {
        const totalLent = BigInt(await contracts.nodeVault.totalLent())
        const totalRepaid = BigInt(await contracts.nodeVault.totalRepaid())
        const principalDebt = totalLent - totalRepaid
        
        // Total borrowed (principal only) - for interest calculation
        totalBorrowed = principalDebt
        
        // Total interest = total debt - principal debt
        totalBorrowInterest = totalDebt - principalDebt
        
        console.log('✅ Calculated totals:', {
          totalDebt: totalDebt.toString(),
          totalBorrowed: totalBorrowed.toString(),
          totalBorrowInterest: totalBorrowInterest.toString(),
        })
      } catch (principalError) {
        const errorMessage = principalError instanceof Error ? principalError.message : String(principalError)
        console.warn('Principal calculation failed, using totalDebt only:', errorMessage)
        // If principal calculation fails, we still have totalDebt
        // Set reasonable defaults for interest calculation
        totalBorrowed = totalDebt // Assume most debt is principal
        totalBorrowInterest = BigInt(0) // Conservative estimate
      }
    } catch (error) {
      console.warn('getTotalDebt() failed:', error)
      totalDebt = BigInt(0)
      totalBorrowed = BigInt(0)
      totalBorrowInterest = BigInt(0)
    }

    try {
      utilizationRate = Number(await contracts.nodeVault.getUtilizationRate())
      console.log('✅ getUtilizationRate():', utilizationRate)
    } catch (error) {
      console.warn('getUtilizationRate() function failed:', error)
      utilizationRate = 0 // Default 0% when no data available
    }

    try {
      borrowAPY = Number(await contracts.nodeVault.getCurrentBorrowAPY())
      console.log('✅ getCurrentBorrowAPY():', borrowAPY)
    } catch (error) {
      console.warn('getCurrentBorrowAPY() function failed:', error)
      borrowAPY = 500 // Default 5% APY (500 basis points)
    }

    try {
      supplyAPY = Number(await contracts.nodeVault.getCurrentSupplyAPY())
      console.log('✅ getCurrentSupplyAPY():', supplyAPY)
    } catch (error) {
      console.warn('getCurrentSupplyAPY() function failed:', error)
      supplyAPY = 300 // Default 3% APY (300 basis points)
    }

    try {
      maxLTV = Number(await contracts.nodeVault.maxLTV())
      console.log('✅ maxLTV():', maxLTV, `(${maxLTV / 100}%)`)
    } catch (error) {
      console.warn('maxLTV() function failed:', error)
      maxLTV = 8000 // Default 80% (8000 basis points)
    }

    try {
      liquidationThreshold = Number(await contracts.nodeVault.LIQUIDATION_THRESHOLD())
      console.log('✅ LIQUIDATION_THRESHOLD():', liquidationThreshold, `(${liquidationThreshold / 100}%)`)
    } catch (error) {
      console.warn('LIQUIDATION_THRESHOLD() function failed:', error)
      liquidationThreshold = 8000 // Default 80% (8000 basis points)
    }

    try {
      // Use getJumpRateModel() for efficiency (single call gets all params)
      const rateModel = await contracts.nodeVault.getJumpRateModel()
      baseRatePerYear = Number(rateModel[0])
      multiplierPerYear = Number(rateModel[1])
      jumpMultiplierPerYear = Number(rateModel[2])
      kink = Number(rateModel[3])
      console.log('✅ getJumpRateModel():', {
        baseRatePerYear,
        multiplierPerYear,
        jumpMultiplierPerYear,
        kink
      })
    } catch (error) {
      console.warn('getJumpRateModel() function failed:', error)
      // Keep default values set above
    }

    try {
      deployerSharePercentage = Number(await contracts.nodeVault.deployerSharePercentage())
      console.log('✅ deployerSharePercentage():', deployerSharePercentage)
    } catch (error) {
      console.warn('deployerSharePercentage() function failed:', error)
      deployerSharePercentage = 15 // Default 15%
    }

    try {
      protocolSharePercentage = Number(await contracts.nodeVault.protocolSharePercentage())
      console.log('✅ protocolSharePercentage():', protocolSharePercentage)
    } catch (error) {
      console.warn('protocolSharePercentage() function failed:', error)
      protocolSharePercentage = 5 // Default 5%
    }

    // NOW calculate total lender interest after we have all the required values
    // Note: Contract doesn't track aggregate lender interest, so we calculate it
    // based on the relationship: supplyAPY = borrowAPY × utilizationRate × (1 - reserveFactor)
    try {
      if (totalBorrowInterest > 0n && totalBorrowed > 0n && totalSupplied > 0n && borrowAPY > 0 && supplyAPY > 0) {
        // Calculate the ratio of lender interest to borrow interest based on APYs
        // totalLenderInterest ≈ totalBorrowInterest × (supplyAPY / borrowAPY) × (totalSupplied / totalBorrowed)
        const apyRatio = BigInt(supplyAPY) * BigInt(10000) / BigInt(borrowAPY) // Scale by 10000 for precision
        const supplyBorrowRatio = totalSupplied * BigInt(10000) / totalBorrowed
        totalLenderInterest = (totalBorrowInterest * apyRatio * supplyBorrowRatio) / (BigInt(10000) * BigInt(10000))
        
        console.log('✅ Calculated total lender interest (formula):', {
          totalLenderInterest: totalLenderInterest.toString(),
          apyRatio: (supplyAPY / borrowAPY).toFixed(4),
          supplyBorrowRatio: (Number(totalSupplied) / Number(totalBorrowed)).toFixed(4)
        })
      } else if (totalBorrowInterest > 0n) {
        // Fallback: Lenders typically get 80-90% of borrower interest (reserve factor ~10-20%)
        // Use utilization as a guide: higher utilization = higher lender share
        const lenderShare = utilizationRate > 5000 ? 85n : 80n // 85% if >50% utilized, else 80%
        totalLenderInterest = (totalBorrowInterest * lenderShare) / 100n
        
        console.log('✅ Calculated total lender interest (fallback):', {
          totalLenderInterest: totalLenderInterest.toString(),
          lenderShare: lenderShare.toString() + '%'
        })
      }
    } catch (error) {
      console.warn('Failed to calculate lender interest:', error)
      // Final fallback: use 80% of borrow interest
      totalLenderInterest = totalBorrowInterest > 0n ? (totalBorrowInterest * 80n) / 100n : 0n
    }

    setProtocolStats({
      totalSupplied,
      totalDebt,
      totalBorrowed,
      totalBorrowInterest,
      totalLenderInterest,
      utilizationRate,
      supplyAPY,
      borrowAPY,
      maxLTV,
      liquidationThreshold,
      baseRatePerYear,
      multiplierPerYear,
      jumpMultiplierPerYear,
      kink,
      deployerSharePercentage,
      protocolSharePercentage,
    })
    
    setIsLoading(prev => ({ ...prev, protocolStats: false }))
  }, [contracts.nodeVault])

  // Fetch user position
  const fetchUserPosition = useCallback(async () => {
    if (!contracts.nodeVault || !contracts.woort || !wallet.address) return

    setIsLoading(prev => ({ ...prev, userPosition: true }))
    
    // Use individual try-catch blocks for each function to handle missing methods gracefully
    let woortBalance = BigInt(0)
    let supplied = BigInt(0)
    let supplyInterest = BigInt(0)
    let borrowed = BigInt(0)
    let borrowInterest = BigInt(0)
    let maxBorrowAmount = BigInt(0)

    try {
      woortBalance = BigInt(await contracts.woort.balanceOf(wallet.address))
      console.log('✅ WOORT balanceOf():', woortBalance.toString())
    } catch (error) {
      console.warn('WOORT balanceOf() function failed:', error)
    }

    try {
      // Use getLenderPosition to get user's supplied amount
      const lenderPosition = await contracts.nodeVault.getLenderPosition(wallet.address)
      supplied = BigInt(lenderPosition.totalSupplied || 0)
      console.log('✅ getLenderPosition():', {
        totalSupplied: supplied.toString()
      })
      
      // Calculate current lender interest (includes accrued + current interest from index)
      if (supplied > 0n) {
        try {
          // Get lender position details for debugging
          const storedInterest = BigInt(lenderPosition.accruedInterest || 0)
          console.log('📊 Lender Position Details:', {
            totalSupplied: supplied.toString(),
            storedAccruedInterest: storedInterest.toString(),
            supplyIndexCheckpoint: lenderPosition.supplyIndexCheckpoint?.toString() || '0',
            lastSupplyTime: lenderPosition.lastSupplyTime?.toString() || '0'
          })
          
          // Get protocol state for debugging
          try {
            const supplyIndex = await contracts.nodeVault.supplyIndex()
            const supplyAPY = await contracts.nodeVault.getCurrentSupplyAPY()
            const lastUpdate = await contracts.nodeVault.lastUpdateTimestamp()
            console.log('📈 Protocol State:', {
              supplyIndex: supplyIndex.toString(),
              supplyAPY: `${Number(supplyAPY) / 100}%`,
              lastUpdateTimestamp: lastUpdate.toString(),
              timeSinceUpdate: `${Math.floor(Date.now() / 1000 - Number(lastUpdate))} seconds`
            })
          } catch (stateError) {
            console.warn('Failed to get protocol state:', stateError)
          }
          
          // Calculate current interest
          const calculatedInterest = await contracts.nodeVault.calculateLenderInterest(wallet.address)
          supplyInterest = BigInt(calculatedInterest)
          
          console.log('✅ calculateLenderInterest():', {
            calculatedInterest: supplyInterest.toString(),
            storedInterest: storedInterest.toString(),
            newInterest: (supplyInterest - storedInterest).toString(),
            formatted: `${Number(supplyInterest) / 1e18} WOORT`
          })
        } catch (interestError) {
          console.error('❌ calculateLenderInterest() failed:', interestError)
          // Fallback to accrued interest if calculateLenderInterest fails
          supplyInterest = BigInt(lenderPosition.accruedInterest || 0)
          console.warn('Using stored accruedInterest as fallback:', supplyInterest.toString())
        }
      } else {
        supplyInterest = BigInt(0)
      }
    } catch (error) {
      console.warn('getLenderPosition() function failed:', error)
    }

    try {
      // Use getBorrowerPosition to get borrower info
      const borrowerPosition = await contracts.nodeVault.getBorrowerPosition(wallet.address)
      const totalBorrowed = BigInt(borrowerPosition.totalBorrowed || 0)
      
      // Calculate current borrower interest (includes accrued + current interest from index)
      if (totalBorrowed > 0n) {
        try {
          // Get borrower position details for debugging
          const storedInterest = BigInt(borrowerPosition.accruedInterest || 0)
          console.log('📊 Borrower Position Details:', {
            totalBorrowed: totalBorrowed.toString(),
            storedAccruedInterest: storedInterest.toString()
          })
          
          // Calculate current interest
          const calculatedInterest = await contracts.nodeVault.calculateBorrowerInterest(wallet.address)
          borrowInterest = BigInt(calculatedInterest)
          
          console.log('✅ calculateBorrowerInterest():', {
            calculatedInterest: borrowInterest.toString(),
            storedInterest: storedInterest.toString(),
            newInterest: (borrowInterest - storedInterest).toString(),
            formatted: `${Number(borrowInterest) / 1e18} WOORT`
          })
        } catch (interestError) {
          console.error('❌ calculateBorrowerInterest() failed:', interestError)
          // Fallback to accrued interest if calculateBorrowerInterest fails
          borrowInterest = BigInt(borrowerPosition.accruedInterest || 0)
          console.warn('Using stored accruedInterest as fallback:', borrowInterest.toString())
        }
      } else {
        borrowInterest = BigInt(0)
      }
      
      borrowed = totalBorrowed + borrowInterest
      console.log('✅ getBorrowerPosition():', {
        totalBorrowed: totalBorrowed.toString(),
        accruedInterest: borrowInterest.toString(),
        totalDebt: borrowed.toString()
      })
    } catch (error) {
      console.warn('getBorrowerPosition() function failed:', error)
    }

    try {
      maxBorrowAmount = BigInt(await contracts.nodeVault.getMaxBorrowAmount(wallet.address))
      console.log('✅ getMaxBorrowAmount():', maxBorrowAmount.toString())
    } catch (error) {
      console.warn('getMaxBorrowAmount() function failed:', error)
    }

    // Calculate total collateral value from deposited nodes
    let collateralValue = BigInt(0)
    let depositedNodesCount = 0
    try {
      const borrowerPosition = await contracts.nodeVault.getBorrowerPosition(wallet.address)
      const OORT_PROTOCOL_TYPE = 1
      
      depositedNodesCount = borrowerPosition.depositedNodes.length
      
      for (const nodeIdentifier of borrowerPosition.depositedNodes) {
        try {
          const nodeInfo = await contracts.nodeVault.getNodeInfo(nodeIdentifier.nodeId, OORT_PROTOCOL_TYPE)
          collateralValue += BigInt(nodeInfo.assetValue || 0)
        } catch (nodeError) {
          console.warn('Failed to get node info for collateral calculation:', nodeError)
        }
      }
      console.log('✅ Total Collateral Value:', collateralValue.toString())
      console.log('✅ Deposited Nodes Count:', depositedNodesCount)
    } catch (error) {
      console.warn('Failed to calculate collateral value:', error)
    }

    setUserPosition({
      woortBalance,
      supplied,
      supplyInterest,
      borrowed,
      borrowInterest,
      maxBorrowAmount,
      collateralValue,
      depositedNodesCount,
    })
    
    setIsLoading(prev => ({ ...prev, userPosition: false }))
  }, [contracts.nodeVault, contracts.woort, wallet.address])

  // Fetch user nodes
  const fetchUserNodes = useCallback(async () => {
    if (!contracts.oortNode || !wallet.address) {
      console.log('❌ Node fetching skipped - missing contract or wallet address')
      return
    }

    console.log('🔍 Starting node fetch for wallet:', wallet.address)
    setIsLoading(prev => ({ ...prev, userNodes: true }))
    
    try {
      // Fetch list of node ADDRESSES owned by user (not IDs!)
      console.log('🔍 Fetching node addresses...')
      const nodeAddresses = await contracts.oortNode.getOwnerNodeList(wallet.address)
      console.log('📋 Found', nodeAddresses.length, 'node addresses:', nodeAddresses.slice(0, 3))
      
      if (nodeAddresses.length === 0) {
        console.log('ℹ️  User has no nodes')
        setUserNodes([])
        return
      }

      // Fetch detailed info for each node
      console.log('🔍 Fetching node details for all', nodeAddresses.length, 'nodes...')
      
      const nodes = []
      for (let i = 0; i < nodeAddresses.length; i++) {
        const nodeAddress = nodeAddresses[i]
        const nodeId = BigInt(nodeAddress)
        console.log(`🔍 Fetching node ${i + 1}/${nodeAddresses.length}: ${nodeAddress}`)
        
        try {
          // For available nodes (not in vault), get data directly from OORT contract
          const nodeData = await contracts.oortNode!.nodeDataInfo(nodeAddress)
          
          console.log(`   ✅ Node data:`, {
            address: nodeAddress,
            balance: nodeData.balance.toString(),
            pledge: nodeData.pledge.toString(),
            totalRewards: nodeData.totalRewards.toString(),
            nodeStatus: nodeData.nodeStatus
          })
          
          const node = {
            id: nodeId,
            owner: nodeData.ownerAddress,
            stakedAmount: BigInt(nodeData.pledge),
            rewards: BigInt(nodeData.totalRewards),
            isActive: nodeData.nodeStatus,
            nodeAddress: nodeData.nodeAddress,
            balance: BigInt(nodeData.balance), // Total balance from OORT contract (pledge + rewards)
            lockedRewards: BigInt(nodeData.lockedRewards),
            maxPledge: BigInt(nodeData.maxPledge),
            endTime: Number(nodeData.endTime),
            nodeType: Number(nodeData.nodeType),
            lockTime: Number(nodeData.lockTime),
          }
          
          nodes.push(node)
          
        } catch (error) {
          console.error(`   ❌ Failed to fetch node ${nodeAddress}:`, error)
          continue // Skip failed nodes but continue with others
        }
      }

      console.log('✅ Successfully fetched', nodes.length, 'out of', nodeAddresses.length, 'nodes')
      setUserNodes(nodes)
      
    } catch (error) {
      console.error('❌ Error fetching user nodes:', error)
      setUserNodes([]) // Set empty array on error
    } finally {
      setIsLoading(prev => ({ ...prev, userNodes: false }))
    }
  }, [contracts.oortNode, wallet.address])

  const fetchDepositedNodes = useCallback(async () => {
    if (!contracts.nodeVault || !contracts.oortNode || !wallet.address) {
      console.log('⚠️  Missing dependencies for fetchDepositedNodes')
      return
    }

    setIsLoading(prev => ({ ...prev, depositedNodes: true }))
    
    try {
      console.log('🔍 Fetching deposited nodes for:', wallet.address)
      
      // Use getBorrowerPosition to get deposited nodes directly
      console.log('📋 Getting borrower position with deposited nodes...')
      
      const borrowerPosition = await contracts.nodeVault.getBorrowerPosition(wallet.address)
      const depositedNodeIdentifiers = borrowerPosition.depositedNodes
      
      console.log(`📊 Found ${depositedNodeIdentifiers.length} deposited node identifiers`)
      
      const depositedNodeDetails: OortNode[] = []
      
      // For each deposited node identifier, get the full node details
      for (const nodeIdentifier of depositedNodeIdentifiers) {
        try {
          const nodeId = nodeIdentifier.nodeId
          const nodeType = nodeIdentifier.nodeType
          
          console.log(`🔍 Processing deposited node: ${nodeId} (type: ${nodeType})`)
          
          // Convert nodeId back to address for OORT nodes (nodeId is the address as BigInt)
          const nodeAddress = '0x' + nodeId.toString(16).padStart(40, '0')
          
          // Get detailed node information from OORT contract
          const nodeData = await contracts.oortNode.nodeDataInfo(nodeAddress)
          
          // 🎯 Get asset value from vault (protocol-agnostic approach)
          const nodeInfo = await contracts.nodeVault.getNodeInfo(nodeId, nodeType)
          const assetValue = BigInt(nodeInfo.assetValue || 0)
          
          console.log(`   ✅ Deposited node data:`, {
            address: nodeAddress,
            assetValue: assetValue.toString(),
            nodeType,
            inVault: nodeInfo.inVault
          })
          
          const node: OortNode = {
            id: nodeId,
            owner: nodeData.ownerAddress,
            stakedAmount: BigInt(nodeData.pledge),
            rewards: BigInt(nodeData.totalRewards),
            isActive: nodeData.nodeStatus,
            nodeAddress: nodeAddress,
            balance: assetValue, // 🎯 Protocol-agnostic asset value from vault
            lockedRewards: BigInt(nodeData.lockedRewards),
            maxPledge: BigInt(nodeData.maxPledge),
            endTime: Number(nodeData.endTime),
            nodeType: Number(nodeData.nodeType),
            lockTime: Number(nodeData.lockTime),
          }
          
          depositedNodeDetails.push(node)
          
        } catch (nodeError) {
          console.log(`⚠️  Error processing deposited node:`, nodeError instanceof Error ? nodeError.message : String(nodeError))
          // Continue with other nodes
        }
      }
      
      console.log(`🎉 Successfully fetched ${depositedNodeDetails.length} deposited nodes`)
      setDepositedNodes(depositedNodeDetails)
      
    } catch (error) {
      console.log('❌ Error fetching deposited nodes:', error)
      setDepositedNodes([])
    } finally {
      setIsLoading(prev => ({ ...prev, depositedNodes: false }))
    }
  }, [contracts.nodeVault, contracts.oortNode, wallet.address])

  // Helper function to check if error is a user rejection
  const isUserRejection = (error: any): boolean => {
    if (!error) return false
    
    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code
    const errorReason = error.reason?.toLowerCase() || ''
    
    // Check for common user rejection patterns
    return (
      errorCode === 'ACTION_REJECTED' ||
      errorCode === 4001 ||
      errorMessage.includes('user rejected') ||
      errorMessage.includes('user denied') ||
      errorMessage.includes('user cancelled') ||
      errorMessage.includes('rejected') ||
      errorReason.includes('rejected')
    )
  }

  // Transaction functions
  const supply = async (amount: string) => {
    if (!contracts.nodeVault || !contracts.woort || !amount) return

    setTxState({ isLoading: true, error: null, operation: 'supply' })
    try {
      const parsedAmount = parseBalance(amount)
      
      // Check allowance first
      const allowance = await contracts.woort.allowance(wallet.address, contracts.nodeVault.target)
      if (BigInt(allowance) < parsedAmount) {
        const approveTx = await contracts.woort.approve(contracts.nodeVault.target, parsedAmount)
        await approveTx.wait()
      }

      const tx = await contracts.nodeVault.supply(parsedAmount)
      await tx.wait()
      
      // Refresh data
      await Promise.all([fetchProtocolStats(), fetchUserPosition()])
    } catch (error: any) {
      // Don't show error if user rejected the transaction
      if (isUserRejection(error)) {
        setTxState({ isLoading: false, error: null, operation: null })
        return
      }
      setTxState({ isLoading: false, error: error.message || 'Transaction failed', operation: null })
      return
    }
    
    setTxState({ isLoading: false, error: null, operation: null })
  }

  const withdraw = async (amount: string) => {
    if (!contracts.nodeVault || !amount) return

    setTxState({ isLoading: true, error: null, operation: 'withdraw' })
    try {
      const parsedAmount = parseBalance(amount)
      const tx = await contracts.nodeVault.withdraw(parsedAmount)
      await tx.wait()
      
      await Promise.all([fetchProtocolStats(), fetchUserPosition()])
    } catch (error: any) {
      // Don't show error if user rejected the transaction
      if (isUserRejection(error)) {
        setTxState({ isLoading: false, error: null, operation: null })
        return
      }
      setTxState({ isLoading: false, error: error.message || 'Transaction failed', operation: null })
      return
    }
    
    setTxState({ isLoading: false, error: null, operation: null })
  }

  const borrow = async (amount: string) => {
    if (!contracts.nodeVault || !amount) return

    setTxState({ isLoading: true, error: null, operation: 'borrow' })
    try {
      const parsedAmount = parseBalance(amount)
      const tx = await contracts.nodeVault.borrow(parsedAmount)
      await tx.wait()
      
      await Promise.all([fetchProtocolStats(), fetchUserPosition()])
    } catch (error: any) {
      // Don't show error if user rejected the transaction
      if (isUserRejection(error)) {
        setTxState({ isLoading: false, error: null, operation: null })
        return
      }
      setTxState({ isLoading: false, error: error.message || 'Transaction failed', operation: null })
      return
    }
    
    setTxState({ isLoading: false, error: null, operation: null })
  }

  const repay = async (amount: string) => {
    if (!contracts.nodeVault || !contracts.woort || !amount) return

    setTxState({ isLoading: true, error: null, operation: 'repay' })
    try {
      const parsedAmount = parseBalance(amount)
      
      // Check allowance first
      const allowance = await contracts.woort.allowance(wallet.address, contracts.nodeVault.target)
      if (BigInt(allowance) < parsedAmount) {
        const approveTx = await contracts.woort.approve(contracts.nodeVault.target, parsedAmount)
        await approveTx.wait()
      }

      const tx = await contracts.nodeVault.repay(parsedAmount)
      await tx.wait()
      
      await Promise.all([fetchProtocolStats(), fetchUserPosition()])
    } catch (error: any) {
      // Don't show error if user rejected the transaction
      if (isUserRejection(error)) {
        setTxState({ isLoading: false, error: null, operation: null })
        return
      }
      setTxState({ isLoading: false, error: error.message || 'Transaction failed', operation: null })
      return
    }
    
    setTxState({ isLoading: false, error: null, operation: null })
  }

  // Node deposit/withdraw functions
  const depositNodes = async (nodeAddresses: string[]) => {
    if (!contracts.nodeVault || !contracts.oortNode || !contracts.proxyManager || nodeAddresses.length === 0) return

    setTxState({ isLoading: true, error: null, operation: 'depositNodes' })
    try {
      const OORT_PROTOCOL_TYPE = 1
      
      console.log('🔧 Step 1: Getting proxy for OORT protocol...')
      // Get or create proxy for OORT protocol
      let proxyAddress: string
      const proxies = await contracts.proxyManager.getProtocolProxies(OORT_PROTOCOL_TYPE)
      
      if (proxies.length > 0) {
        proxyAddress = proxies[0]
        console.log('✅ Using existing proxy:', proxyAddress)
      } else {
        console.log('🔧 Creating new proxy...')
        // First simulate to get the return value (proxy address)
        proxyAddress = await contracts.nodeVault.createProxyForProtocol.staticCall(OORT_PROTOCOL_TYPE)
        console.log('📋 Proxy address will be:', proxyAddress)
        
        // Then send the actual transaction
        const tx = await contracts.nodeVault.createProxyForProtocol(OORT_PROTOCOL_TYPE)
        await tx.wait()
        console.log('✅ New proxy created:', proxyAddress)
      }

      console.log('🔄 Step 2: Transferring node ownership to proxy...')
      // Transfer ownership to proxy
      const transferTx = await contracts.oortNode.changeOwner(proxyAddress, nodeAddresses)
      await transferTx.wait()
      console.log('✅ Node ownership transferred')

      console.log('🏦 Step 3: Depositing nodes as collateral...')
      // Convert addresses to node IDs (use BigInt of address)
      const nodeIds = nodeAddresses.map(addr => BigInt(addr))
      
      // ✅ NEW: No nodeTypes array needed (vault-level nodeType)
      const depositTx = await contracts.nodeVault.depositNodes(nodeIds)
      await depositTx.wait()
      console.log('✅ Nodes deposited as collateral')
      
      // Wait a bit for blockchain state to propagate (especially important for OORT RPC)
      console.log('⏳ Waiting for blockchain state to propagate...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refresh data
      console.log('🔄 Refreshing all data...')
      await Promise.all([fetchProtocolStats(), fetchUserPosition(), fetchUserNodes(), fetchDepositedNodes()])
      console.log('✅ Data refresh complete')
    } catch (error: any) {
      console.error('❌ Node deposit failed:', error)
      // Don't show error if user rejected the transaction
      if (isUserRejection(error)) {
        setTxState({ isLoading: false, error: null, operation: null })
        return
      }
      setTxState({ isLoading: false, error: error.message || 'Node deposit failed', operation: null })
      return
    }
    
    setTxState({ isLoading: false, error: null, operation: null })
  }

  const withdrawNodes = async (nodeAddresses: string[]) => {
    if (!contracts.nodeVault || nodeAddresses.length === 0) return

    setTxState({ isLoading: true, error: null, operation: 'withdrawNodes' })
    try {
      // Convert addresses to node IDs
      const nodeIds = nodeAddresses.map(addr => BigInt(addr))
      
      // ✅ NEW: No nodeTypes array needed (vault-level nodeType)
      const tx = await contracts.nodeVault.withdrawNodes(nodeIds)
      await tx.wait()
      
      // Wait a bit for blockchain state to propagate (especially important for OORT RPC)
      console.log('⏳ Waiting for blockchain state to propagate...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refresh data
      console.log('🔄 Refreshing all data...')
      await Promise.all([fetchProtocolStats(), fetchUserPosition(), fetchUserNodes(), fetchDepositedNodes()])
      console.log('✅ Data refresh complete')
    } catch (error: any) {
      // Don't show error if user rejected the transaction
      if (isUserRejection(error)) {
        setTxState({ isLoading: false, error: null, operation: null })
        return
      }
      setTxState({ isLoading: false, error: error.message || 'Node withdrawal failed', operation: null })
      return
    }
    
    setTxState({ isLoading: false, error: null, operation: null })
  }

  // Auto-fetch data when contracts are available
  useEffect(() => {
    if (contracts.nodeVault) {
      fetchProtocolStats()
    }
  }, [contracts.nodeVault, fetchProtocolStats])

  useEffect(() => {
    if (wallet.isConnected && wallet.isCorrectNetwork && contracts.nodeVault && contracts.woort) {
      fetchUserPosition()
    }
  }, [wallet.isConnected, wallet.isCorrectNetwork, contracts.nodeVault, contracts.woort, fetchUserPosition])

  // Auto-fetch nodes when wallet is connected and on correct network
  useEffect(() => {
    console.log('🔍 Node fetch useEffect triggered:', {
      isConnected: wallet.isConnected,
      isCorrectNetwork: wallet.isCorrectNetwork,
      hasOortNode: !!contracts.oortNode,
      walletAddress: wallet.address
    })
    
    if (wallet.isConnected && wallet.isCorrectNetwork && contracts.oortNode) {
      console.log('✅ All conditions met - calling fetchUserNodes()')
      fetchUserNodes()
    } else {
      console.log('❌ Conditions not met - skipping node fetch')
    }
  }, [wallet.isConnected, wallet.isCorrectNetwork, contracts.oortNode, fetchUserNodes])

  // Auto-fetch deposited nodes when wallet is connected and on correct network
  useEffect(() => {
    if (wallet.isConnected && wallet.isCorrectNetwork && contracts.nodeVault && contracts.oortNode) {
      console.log('✅ Fetching deposited nodes')
      fetchDepositedNodes()
    }
  }, [wallet.isConnected, wallet.isCorrectNetwork, contracts.nodeVault, contracts.oortNode, fetchDepositedNodes])

  return {
    protocolStats,
    userPosition,
    userNodes,
    depositedNodes,
    isLoading,
    txState,
    // Actions
    supply,
    withdraw,
    borrow,
    repay,
    depositNodes,
    withdrawNodes,
    // Manual refresh functions
    refreshProtocolStats: fetchProtocolStats,
    refreshUserPosition: fetchUserPosition,
    refreshUserNodes: fetchUserNodes,
    refreshDepositedNodes: fetchDepositedNodes,
  }
}
