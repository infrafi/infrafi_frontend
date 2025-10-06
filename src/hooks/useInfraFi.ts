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
  const [txState, setTxState] = useState<TransactionState>({ isLoading: false, error: null })
  
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
    let totalBorrowed = BigInt(0)
    let utilizationRate = 0
    let borrowAPY = 0
    let supplyAPY = 300 // Default 3% APY (300 basis points)
    
    try {
      totalSupplied = BigInt(await contracts.nodeVault.getTotalSupplied())
      console.log('✅ getTotalSupplied():', totalSupplied.toString())
    } catch (error) {
      console.warn('getTotalSupplied() function failed:', error)
    }

    try {
      // ✅ FIX: Get total debt directly from contract instead of calculating
      totalBorrowed = BigInt(await contracts.nodeVault.getTotalDebt())
      console.log('✅ getTotalDebt():', totalBorrowed.toString())
    } catch (error) {
      console.warn('getTotalDebt() function failed:', error)
      totalBorrowed = BigInt(0)
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

    setProtocolStats({
      totalSupplied,
      totalBorrowed,
      utilizationRate,
      supplyAPY,
      borrowAPY,
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
    let borrowed = BigInt(0)
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
      console.log('✅ getLenderPosition():', {totalSupplied: supplied.toString()})
    } catch (error) {
      console.warn('getLenderPosition() function failed:', error)
    }

    try {
      // Use getBorrowerPosition to get borrower info
      const borrowerPosition = await contracts.nodeVault.getBorrowerPosition(wallet.address)
      borrowed = BigInt(borrowerPosition.totalBorrowed || 0) + BigInt(borrowerPosition.accruedInterest || 0)
      console.log('✅ getBorrowerPosition():', {
        totalBorrowed: borrowerPosition.totalBorrowed.toString(),
        accruedInterest: borrowerPosition.accruedInterest.toString(),
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

    setUserPosition({
      woortBalance,
      supplied,
      borrowed,
      maxBorrowAmount,
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

      // Fetch detailed info for each node using nodeDataInfo(address)
      const nodesToFetch = nodeAddresses.slice(0, 50) // Limit for performance
      console.log('🔍 Fetching node details for', nodesToFetch.length, 'nodes...')
      
      const nodes = []
      for (let i = 0; i < nodesToFetch.length; i++) {
        const nodeAddress = nodesToFetch[i]
        console.log(`🔍 Fetching node ${i + 1}/${nodesToFetch.length}: ${nodeAddress}`)
        
        try {
          // Use nodeDataInfo with the node address
          const nodeData = await contracts.oortNode!.nodeDataInfo(nodeAddress)
          console.log(`   ✅ Raw nodeData:`, nodeData)
          
          // Parse the rich data structure from the test script
          const node = {
            id: BigInt(nodeAddress), // Use address as ID
            owner: nodeData.ownerAddress,
            stakedAmount: BigInt(nodeData.pledge), // Original pledge amount
            rewards: BigInt(nodeData.totalRewards), // Total earned rewards
            isActive: nodeData.nodeStatus,
            // Additional data available from OORT contract
            nodeAddress: nodeData.nodeAddress,
            balance: BigInt(nodeData.balance), // pledge + rewards  
            lockedRewards: BigInt(nodeData.lockedRewards),
            maxPledge: BigInt(nodeData.maxPledge),
            endTime: Number(nodeData.endTime),
            nodeType: Number(nodeData.nodeType),
            lockTime: Number(nodeData.lockTime),
          }
          
          console.log(`   ✅ Parsed node:`, {
            address: nodeAddress,
            pledge: `${node.stakedAmount}`,
            rewards: `${node.rewards}`,
            balance: `${node.balance}`,
            isActive: node.isActive
          })
          
          nodes.push(node)
          
        } catch (error) {
          console.error(`   ❌ Failed to fetch node ${nodeAddress}:`, error)
          continue // Skip failed nodes but continue with others
        }
      }

      console.log('✅ Successfully fetched', nodes.length, 'out of', nodesToFetch.length, 'nodes')
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
          
          const node: OortNode = {
            id: nodeId,
            owner: wallet.address,
            stakedAmount: nodeData[0] || BigInt(0), // pledge
            rewards: nodeData[1] || BigInt(0), // rewards
            isActive: true,
            // Rich data from nodeDataInfo
            nodeAddress: nodeAddress,
            balance: nodeData[2] || BigInt(0), // pledge + rewards
            lockedRewards: nodeData[3] || BigInt(0),
            maxPledge: nodeData[4] || BigInt(0),
            endTime: Number(nodeData[5] || 0),
            nodeType: Number(nodeData[6] || 1),
            lockTime: Number(nodeData[7] || 0)
          }
          
          depositedNodeDetails.push(node)
          console.log(`✅ Successfully processed deposited node: ${nodeAddress}`)
          
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

  // Transaction functions
  const supply = async (amount: string) => {
    if (!contracts.nodeVault || !contracts.woort || !amount) return

    setTxState({ isLoading: true, error: null })
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
      setTxState({ isLoading: false, error: error.message || 'Transaction failed' })
      return
    }
    
    setTxState({ isLoading: false, error: null })
  }

  const withdraw = async (amount: string) => {
    if (!contracts.nodeVault || !amount) return

    setTxState({ isLoading: true, error: null })
    try {
      const parsedAmount = parseBalance(amount)
      const tx = await contracts.nodeVault.withdraw(parsedAmount)
      await tx.wait()
      
      await Promise.all([fetchProtocolStats(), fetchUserPosition()])
    } catch (error: any) {
      setTxState({ isLoading: false, error: error.message || 'Transaction failed' })
      return
    }
    
    setTxState({ isLoading: false, error: null })
  }

  const borrow = async (amount: string) => {
    if (!contracts.nodeVault || !amount) return

    setTxState({ isLoading: true, error: null })
    try {
      const parsedAmount = parseBalance(amount)
      const tx = await contracts.nodeVault.borrow(parsedAmount)
      await tx.wait()
      
      await Promise.all([fetchProtocolStats(), fetchUserPosition()])
    } catch (error: any) {
      setTxState({ isLoading: false, error: error.message || 'Transaction failed' })
      return
    }
    
    setTxState({ isLoading: false, error: null })
  }

  const repay = async (amount: string) => {
    if (!contracts.nodeVault || !contracts.woort || !amount) return

    setTxState({ isLoading: true, error: null })
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
      setTxState({ isLoading: false, error: error.message || 'Transaction failed' })
      return
    }
    
    setTxState({ isLoading: false, error: null })
  }

  // Node deposit/withdraw functions
  const depositNodes = async (nodeAddresses: string[]) => {
    if (!contracts.nodeVault || !contracts.oortNode || !contracts.proxyManager || nodeAddresses.length === 0) return

    setTxState({ isLoading: true, error: null })
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
        const tx = await contracts.proxyManager.getProxyForDeposit(OORT_PROTOCOL_TYPE)
        await tx.wait()
        
        const updatedProxies = await contracts.proxyManager.getProtocolProxies(OORT_PROTOCOL_TYPE)
        proxyAddress = updatedProxies[updatedProxies.length - 1]
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
      
      // Refresh data
      await Promise.all([fetchProtocolStats(), fetchUserPosition(), fetchUserNodes(), fetchDepositedNodes()])
    } catch (error: any) {
      console.error('❌ Node deposit failed:', error)
      setTxState({ isLoading: false, error: error.message || 'Node deposit failed' })
      return
    }
    
    setTxState({ isLoading: false, error: null })
  }

  const withdrawNodes = async (nodeAddresses: string[]) => {
    if (!contracts.nodeVault || nodeAddresses.length === 0) return

    setTxState({ isLoading: true, error: null })
    try {
      // Convert addresses to node IDs
      const nodeIds = nodeAddresses.map(addr => BigInt(addr))
      
      // ✅ NEW: No nodeTypes array needed (vault-level nodeType)
      const tx = await contracts.nodeVault.withdrawNodes(nodeIds)
      await tx.wait()
      
      // Refresh data
      await Promise.all([fetchProtocolStats(), fetchUserPosition(), fetchUserNodes(), fetchDepositedNodes()])
    } catch (error: any) {
      setTxState({ isLoading: false, error: error.message || 'Node withdrawal failed' })
      return
    }
    
    setTxState({ isLoading: false, error: null })
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
