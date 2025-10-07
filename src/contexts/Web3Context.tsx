'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers, BrowserProvider, Contract } from 'ethers'
import { CONTRACT_ADDRESSES, OORT_NETWORK, NODE_VAULT_ABI, WOORT_ABI, OORT_NODE_ABI, NODE_PROXY_MANAGER_ABI } from '@/config/contracts'
import { WalletState } from '@/types/contracts'

interface ContractInstances {
  nodeVault: Contract | null
  woort: Contract | null
  oortNode: Contract | null
  proxyManager: Contract | null
}

interface Web3ContextType {
  wallet: WalletState
  contracts: ContractInstances
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isCorrectNetwork: false,
    chainId: null,
  })

  const [contracts, setContracts] = useState<ContractInstances>({
    nodeVault: null,
    woort: null,
    oortNode: null,
    proxyManager: null,
  })

  // Initialize read-only contracts (no wallet required)
  const initializeReadOnlyContracts = async () => {
    try {
      console.log('🔧 Initializing read-only contracts...')
      const provider = new ethers.JsonRpcProvider(OORT_NETWORK.rpcUrl)
      
      const nodeVault = new Contract(CONTRACT_ADDRESSES.NodeVaultUpgradeable, NODE_VAULT_ABI, provider)
      const woort = new Contract(CONTRACT_ADDRESSES.WOORT, WOORT_ABI, provider)
      const oortNode = new Contract(CONTRACT_ADDRESSES.OortNodeContract, OORT_NODE_ABI, provider)
      const proxyManager = new Contract(CONTRACT_ADDRESSES.NodeProxyManager, NODE_PROXY_MANAGER_ABI, provider)

      console.log('✅ Read-only contracts created')

      setContracts({ nodeVault, woort, oortNode, proxyManager })
    } catch (error) {
      console.error('Error initializing read-only contracts:', error)
    }
  }

  const initializeContracts = async (provider: BrowserProvider) => {
    try {
      console.log('🔧 Initializing contracts with signer...')
      const signer = await provider.getSigner()
      
      const nodeVault = new Contract(CONTRACT_ADDRESSES.NodeVaultUpgradeable, NODE_VAULT_ABI, signer)
      const woort = new Contract(CONTRACT_ADDRESSES.WOORT, WOORT_ABI, signer)
      const oortNode = new Contract(CONTRACT_ADDRESSES.OortNodeContract, OORT_NODE_ABI, signer)
      const proxyManager = new Contract(CONTRACT_ADDRESSES.NodeProxyManager, NODE_PROXY_MANAGER_ABI, signer)

      console.log('✅ Contracts created with signer:', {
        nodeVault: !!nodeVault,
        woort: !!woort,
        oortNode: !!oortNode,
        proxyManager: !!proxyManager,
        oortNodeAddress: CONTRACT_ADDRESSES.OortNodeContract
      })

      setContracts({ nodeVault, woort, oortNode, proxyManager })
      console.log('✅ Contracts set in state')
    } catch (error) {
      console.error('Error initializing contracts:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      
      const address = accounts[0]
      const chainId = Number(network.chainId)
      const isCorrectNetwork = chainId === OORT_NETWORK.chainId

      setWallet({
        address,
        isConnected: true,
        isCorrectNetwork,
        chainId,
      })

      if (isCorrectNetwork) {
        await initializeContracts(provider)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isCorrectNetwork: false,
      chainId: null,
    })
    // Revert to read-only contracts so protocol data is still visible
    initializeReadOnlyContracts()
  }

  const switchNetwork = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${OORT_NETWORK.chainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${OORT_NETWORK.chainId.toString(16)}`,
              chainName: OORT_NETWORK.name,
              rpcUrls: [OORT_NETWORK.rpcUrl],
              blockExplorerUrls: [OORT_NETWORK.explorer],
            }],
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
        }
      } else {
        console.error('Error switching network:', error)
      }
    }
  }

  // Initialize read-only contracts on mount (for viewing protocol data without wallet)
  useEffect(() => {
    initializeReadOnlyContracts()
  }, [])

  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return

      try {
        const provider = new BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork()
          const chainId = Number(network.chainId)
          const isCorrectNetwork = chainId === OORT_NETWORK.chainId

          setWallet({
            address: accounts[0].address,
            isConnected: true,
            isCorrectNetwork,
            chainId,
          })

          if (isCorrectNetwork) {
            await initializeContracts(provider)
          }
        }
      } catch (error) {
        console.error('Error auto-connecting:', error)
      }
    }

    autoConnect()
  }, [])

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        connectWallet()
      }
    }

    const handleChainChanged = () => {
      // Reload to ensure clean state
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const value = {
    wallet,
    contracts,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Extend window object for MetaMask
declare global {
  interface Window {
    ethereum?: any
  }
}
