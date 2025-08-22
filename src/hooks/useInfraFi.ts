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
  const [txState, setTxState] = useState<TransactionState>({ isLoading: false, error: null })
  
  const [isLoading, setIsLoading] = useState({
    protocolStats: false,
    userPosition: false,
    userNodes: false,
  })

  // Fetch protocol statistics
  const fetchProtocolStats = useCallback(async () => {
    if (!contracts.nodeVault) return

    setIsLoading(prev => ({ ...prev, protocolStats: true }))
    
    // Use individual try-catch blocks for each function to handle missing methods gracefully
    let totalSupplied = BigInt(0)
    let utilizationRate = 0
    let borrowAPY = 0
    let supplyAPY = 300 // Default 3% APY (300 basis points)
    
    try {
      totalSupplied = BigInt(await contracts.nodeVault.totalSupplied())
    } catch (error) {
      console.warn('totalSupplied() function not available:', error)
    }

    try {
      utilizationRate = Number(await contracts.nodeVault.getUtilizationRate())
    } catch (error) {
      console.warn('getUtilizationRate() function not available:', error)
      utilizationRate = 0 // Default 0% when no data available
    }

    try {
      borrowAPY = Number(await contracts.nodeVault.getCurrentBorrowAPY())
    } catch (error) {
      console.warn('getCurrentBorrowAPY() function not available:', error)
      borrowAPY = 500 // Default 5% APY (500 basis points)
    }

    try {
      supplyAPY = Number(await contracts.nodeVault.getCurrentSupplyAPY())
    } catch (error) {
      console.warn('getCurrentSupplyAPY() function not available:', error)
      supplyAPY = 300 // Default 3% APY (300 basis points)
    }

    const totalBorrowed = (totalSupplied * BigInt(utilizationRate)) / BigInt(10000)

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
    } catch (error) {
      console.warn('balanceOf() function not available:', error)
    }

    try {
      supplied = BigInt(await contracts.nodeVault.getUserSupplied(wallet.address))
    } catch (error) {
      console.warn('getUserSupplied() function not available:', error)
    }

    try {
      borrowed = BigInt(await contracts.nodeVault.getUserBorrowed(wallet.address))
    } catch (error) {
      console.warn('getUserBorrowed() function not available:', error)
    }

    try {
      maxBorrowAmount = BigInt(await contracts.nodeVault.getUserMaxBorrowAmount(wallet.address))
    } catch (error) {
      console.warn('getUserMaxBorrowAmount() function not available:', error)
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

  return {
    protocolStats,
    userPosition,
    userNodes,
    isLoading,
    txState,
    // Actions
    supply,
    withdraw,
    borrow,
    repay,
    // Manual refresh functions
    refreshProtocolStats: fetchProtocolStats,
    refreshUserPosition: fetchUserPosition,
    refreshUserNodes: fetchUserNodes,
  }
}
