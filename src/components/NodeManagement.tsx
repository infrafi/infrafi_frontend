'use client'

import { useState } from 'react'
import { OortNode } from '@/types/contracts'
import { formatBalance } from '@/lib/utils'
import { Server, RefreshCw, AlertCircle } from 'lucide-react'

interface NodeManagementProps {
  userNodes: OortNode[]
  depositedNodes: OortNode[]
  isLoading: {
    userNodes: boolean
    depositedNodes: boolean
  }
  onRefreshNodes: () => void
  onRefreshDepositedNodes: () => void
  onDepositNodes: (nodeAddresses: string[]) => Promise<void>
  onWithdrawNodes: (nodeAddresses: string[]) => Promise<void>
  txState: { isLoading: boolean; error: string | null }
  borrowedAmount: bigint
  totalCollateralValue: bigint
  maxLTV: number  // Max LTV in basis points (e.g., 8000 = 80%)
}

// Reusable NodeCard component
function NodeCard({ 
  node, 
  isSelected, 
  onSelect, 
  type 
}: {
  node: OortNode
  isSelected: boolean
  onSelect: () => void
  type: 'available' | 'deposited'
}) {
  const borderColor = type === 'available' 
    ? (isSelected ? 'border-blue-500/60 bg-blue-900/10' : 'border-gray-600') 
    : (isSelected ? 'border-purple-500/60 bg-purple-900/10' : 'border-gray-600')
  
  const statusColor = type === 'available' ? 'text-green-400' : 'text-purple-400'
  const statusText = type === 'available' ? 'Available' : 'Deposited'
  const statusIcon = type === 'available' ? '✅' : '🏦'
  
  return (
    <div className={`p-4 bg-gray-700 rounded-lg border transition-colors hover:bg-gray-600/50 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
          />
          <div className={`p-2 rounded-lg ${node.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-white">Node {node.nodeAddress.slice(0, 8)}...</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs">{statusIcon}</span>
              <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Balance</p>
          <p className="font-medium text-white">
            {formatBalance(node.balance)} WOORT
          </p>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Node Address: {node.nodeAddress}</p>
      </div>
    </div>
  )
}

export function NodeManagement({ 
  userNodes, 
  depositedNodes, 
  isLoading, 
  onRefreshNodes, 
  onRefreshDepositedNodes, 
  onDepositNodes, 
  onWithdrawNodes, 
  txState,
  borrowedAmount,
  totalCollateralValue,
  maxLTV
}: NodeManagementProps) {
  const [selectedAvailableNodes, setSelectedAvailableNodes] = useState<string[]>([])
  const [selectedDepositedNodes, setSelectedDepositedNodes] = useState<string[]>([])
  
  // Calculate maximum withdrawable collateral
  const calculateMaxWithdrawable = (): bigint => {
    if (borrowedAmount === BigInt(0)) {
      // No debt, can withdraw all collateral
      return totalCollateralValue
    }
    
    // Convert maxLTV from basis points to decimal (e.g., 8000 -> 0.8)
    const maxLTVDecimal = maxLTV / 10000
    
    // Calculate minimum required collateral to maintain max LTV
    // minRequiredCollateral = borrowedAmount / maxLTV
    // Use BigInt arithmetic to avoid precision issues
    const borrowedAmountScaled = borrowedAmount * BigInt(10000)
    const minRequiredCollateral = borrowedAmountScaled / BigInt(maxLTV)
    
    // Calculate max withdrawable
    const maxWithdrawable = totalCollateralValue > minRequiredCollateral 
      ? totalCollateralValue - minRequiredCollateral 
      : BigInt(0)
    
    return maxWithdrawable
  }
  
  const maxWithdrawableCollateral = calculateMaxWithdrawable()
  
  // Calculate total value of selected nodes for withdrawal
  const selectedNodesValue = selectedDepositedNodes.reduce((sum, nodeAddress) => {
    const node = depositedNodes.find(n => n.nodeAddress === nodeAddress)
    return sum + (node?.balance || BigInt(0))
  }, BigInt(0))
  
  // Check if withdrawal would exceed limit
  // Only check limit if there's debt; otherwise allow all withdrawals
  const wouldExceedLimit = borrowedAmount > BigInt(0) && selectedNodesValue > maxWithdrawableCollateral
  
  // Check if withdrawal is allowed
  const canWithdraw = selectedDepositedNodes.length > 0 && (borrowedAmount === BigInt(0) || selectedNodesValue <= maxWithdrawableCollateral)
  
  // Available nodes selection handlers
  const handleSelectAllAvailable = () => {
    if (selectedAvailableNodes.length === userNodes.length) {
      setSelectedAvailableNodes([])
    } else {
      setSelectedAvailableNodes(userNodes.map(node => node.nodeAddress))
    }
  }

  const handleSelectAvailableNode = (nodeAddress: string) => {
    if (selectedAvailableNodes.includes(nodeAddress)) {
      setSelectedAvailableNodes(selectedAvailableNodes.filter(addr => addr !== nodeAddress))
    } else {
      setSelectedAvailableNodes([...selectedAvailableNodes, nodeAddress])
    }
  }

  // Deposited nodes selection handlers
  const handleSelectAllDeposited = () => {
    if (selectedDepositedNodes.length === depositedNodes.length) {
      setSelectedDepositedNodes([])
    } else {
      setSelectedDepositedNodes(depositedNodes.map(node => node.nodeAddress))
    }
  }

  const handleSelectDepositedNode = (nodeAddress: string) => {
    if (selectedDepositedNodes.includes(nodeAddress)) {
      setSelectedDepositedNodes(selectedDepositedNodes.filter(addr => addr !== nodeAddress))
    } else {
      setSelectedDepositedNodes([...selectedDepositedNodes, nodeAddress])
    }
  }

  const handleDepositSelected = async () => {
    if (selectedAvailableNodes.length > 0) {
      await onDepositNodes(selectedAvailableNodes)
      setSelectedAvailableNodes([])
    }
  }

  const handleWithdrawSelected = async () => {
    if (selectedDepositedNodes.length > 0 && canWithdraw) {
      await onWithdrawNodes(selectedDepositedNodes)
      setSelectedDepositedNodes([])
    }
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Node Management</h3>
        <div className="flex space-x-2">
          <button
            onClick={onRefreshNodes}
            disabled={isLoading.userNodes}
            className="btn btn-secondary flex items-center space-x-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading.userNodes ? 'animate-spin' : ''}`} />
            <span>Refresh Available</span>
          </button>
          <button
            onClick={onRefreshDepositedNodes}
            disabled={isLoading.depositedNodes}
            className="btn btn-secondary flex items-center space-x-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading.depositedNodes ? 'animate-spin' : ''}`} />
            <span>Refresh Deposited</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {txState.error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Transaction Error</p>
              <p className="text-sm mt-1 text-gray-300">{txState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Nodes Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">📱 Available Nodes ({userNodes.length})</h4>
          {userNodes.length > 0 && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAllAvailable}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {selectedAvailableNodes.length === userNodes.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-400">
                {selectedAvailableNodes.length} selected
              </span>
              <button
                onClick={handleDepositSelected}
                disabled={selectedAvailableNodes.length === 0 || txState.isLoading}
                className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {txState.isLoading && txState.operation === 'depositNodes' ? 'Processing...' : `Deposit ${selectedAvailableNodes.length} Nodes`}
              </button>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Select available nodes to deposit as collateral for borrowing WOORT.
        </p>

        {isLoading.userNodes ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-gray-700 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : userNodes.length > 0 ? (
          <div className="space-y-4">
            {userNodes.map((node) => (
              <NodeCard 
                key={node.nodeAddress}
                node={node}
                isSelected={selectedAvailableNodes.includes(node.nodeAddress)}
                onSelect={() => handleSelectAvailableNode(node.nodeAddress)}
                type="available"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-gray-400">No available nodes found</p>
          </div>
        )}
      </div>

      {/* Deposited Nodes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">🏦 Deposited Nodes ({depositedNodes.length})</h4>
          {depositedNodes.length > 0 && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAllDeposited}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                {selectedDepositedNodes.length === depositedNodes.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-400">
                {selectedDepositedNodes.length} selected
              </span>
              <button
                onClick={handleWithdrawSelected}
                disabled={selectedDepositedNodes.length === 0 || txState.isLoading || !canWithdraw}
                className="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw {selectedDepositedNodes.length} Nodes
              </button>
            </div>
          )}
        </div>
        
        {/* Max Withdrawable Info */}
        {borrowedAmount > BigInt(0) && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Maximum Withdrawable Collateral:</span>
              <span className="text-sm font-semibold text-blue-400">
                {formatBalance(maxWithdrawableCollateral)} WOORT
              </span>
            </div>
            {selectedDepositedNodes.length > 0 && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-500/20">
                <span className="text-sm text-gray-300">Selected Nodes Value:</span>
                <span className={`text-sm font-semibold ${wouldExceedLimit ? 'text-red-400' : 'text-green-400'}`}>
                  {formatBalance(selectedNodesValue)} WOORT
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Warning Message */}
        {wouldExceedLimit && selectedDepositedNodes.length > 0 && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-400">Cannot Withdraw Selected Nodes</p>
                <p className="text-sm mt-1 text-gray-300">
                  Withdrawing these nodes would exceed your maximum withdrawable collateral limit. 
                  The selected nodes are worth {formatBalance(selectedNodesValue)} WOORT, but you can only 
                  withdraw up to {formatBalance(maxWithdrawableCollateral)} WOORT while maintaining your 
                  current loan position.
                </p>
                <p className="text-sm mt-2 text-gray-400">
                  <strong>Options:</strong> Repay some of your loan or select fewer/smaller nodes to withdraw.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-400 mb-4">
          These nodes are currently deposited as collateral. {borrowedAmount > BigInt(0) 
            ? 'You can withdraw up to the maximum withdrawable limit shown above.' 
            : 'Select nodes to withdraw.'}
        </p>

        {isLoading.depositedNodes ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-gray-700 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : depositedNodes.length > 0 ? (
          <div className="space-y-4">
            {depositedNodes.map((node) => (
              <NodeCard 
                key={node.nodeAddress}
                node={node}
                isSelected={selectedDepositedNodes.includes(node.nodeAddress)}
                onSelect={() => handleSelectDepositedNode(node.nodeAddress)}
                type="deposited"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-3xl mb-2">🏦</div>
            <p className="text-gray-400">No nodes deposited as collateral yet</p>
            <p className="text-gray-500 text-sm mt-1">Deposit some nodes above to start borrowing</p>
          </div>
        )}
      </div>
    </div>
  )
}