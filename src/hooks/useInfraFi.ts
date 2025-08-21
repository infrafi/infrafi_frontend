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
    try {
      const [totalSupplied, utilizationRate, borrowAPY, supplyAPY] = await Promise.all([
        contracts.nodeVault.totalSupplied(),
        contracts.nodeVault.getUtilizationRate(),
        contracts.nodeVault.getCurrentBorrowAPY(),
        contracts.nodeVault.getCurrentSupplyAPY(),
      ])

      const utilization = Number(utilizationRate)
      const totalBorrowed = (BigInt(totalSupplied) * BigInt(utilization)) / BigInt(10000)

      setProtocolStats({
        totalSupplied: BigInt(totalSupplied),
        totalBorrowed,
        utilizationRate: utilization,
        supplyAPY: Number(supplyAPY),
        borrowAPY: Number(borrowAPY),
      })
    } catch (error) {
      console.error('Error fetching protocol stats:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, protocolStats: false }))
    }
  }, [contracts.nodeVault])

  // Fetch user position
  const fetchUserPosition = useCallback(async () => {
    if (!contracts.nodeVault || !contracts.woort || !wallet.address) return

    setIsLoading(prev => ({ ...prev, userPosition: true }))
    try {
      const [woortBalance, supplied, borrowed, maxBorrowAmount] = await Promise.all([
        contracts.woort.balanceOf(wallet.address),
        contracts.nodeVault.getUserSupplied(wallet.address),
        contracts.nodeVault.getUserBorrowed(wallet.address),
        contracts.nodeVault.getUserMaxBorrowAmount(wallet.address),
      ])

      setUserPosition({
        woortBalance: BigInt(woortBalance),
        supplied: BigInt(supplied),
        borrowed: BigInt(borrowed),
        maxBorrowAmount: BigInt(maxBorrowAmount),
      })
    } catch (error) {
      console.error('Error fetching user position:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, userPosition: false }))
    }
  }, [contracts.nodeVault, contracts.woort, wallet.address])

  // Fetch user nodes
  const fetchUserNodes = useCallback(async () => {
    if (!contracts.oortNode || !wallet.address) return

    setIsLoading(prev => ({ ...prev, userNodes: true }))
    try {
      console.log('Fetching user nodes for:', wallet.address)
      // Note: This may fail if user has no nodes or function doesn't exist
      // We'll handle it gracefully
      const nodeIds = await contracts.oortNode.getOwnerNodeList(wallet.address)
      
      const nodes = await Promise.all(
        nodeIds.map(async (nodeId: bigint) => {
          const nodeInfo = await contracts.oortNode!.getNodeInfo(nodeId)
          return {
            id: Number(nodeId),
            owner: nodeInfo.owner,
            stakedAmount: BigInt(nodeInfo.stakedAmount),
            rewards: BigInt(nodeInfo.rewards),
            isActive: nodeInfo.isActive,
          }
        })
      )

      setUserNodes(nodes)
    } catch (error) {
      console.warn('Could not fetch user nodes:', error)
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

  // Only fetch nodes manually to avoid errors
  // useEffect(() => {
  //   if (wallet.isConnected && wallet.isCorrectNetwork && contracts.oortNode) {
  //     fetchUserNodes()
  //   }
  // }, [wallet.isConnected, wallet.isCorrectNetwork, contracts.oortNode, fetchUserNodes])

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
