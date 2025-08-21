'use client'

import { useState } from 'react'
import { UserPosition, ProtocolStats, TransactionState, TransactionFunction } from '@/types/contracts'
import { formatBalance, formatAPY, validateAmount, calculateHealthFactor } from '@/lib/utils'
import { CreditCard, RefreshCw, AlertCircle } from 'lucide-react'

interface BorrowRepayProps {
  userPosition: UserPosition | null
  protocolStats: ProtocolStats | null
  txState: TransactionState
  onBorrow: TransactionFunction
  onRepay: TransactionFunction
}

export function BorrowRepay({ userPosition, protocolStats, txState, onBorrow, onRepay }: BorrowRepayProps) {
  const [activeTab, setActiveTab] = useState<'borrow' | 'repay'>('borrow')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [repayAmount, setRepayAmount] = useState('')

  const hasCollateral = userPosition && userPosition.maxBorrowAmount > BigInt(0)
  const hasDebt = userPosition && userPosition.borrowed > BigInt(0)

  const borrowValidation = validateAmount(
    borrowAmount, 
    userPosition?.maxBorrowAmount || BigInt(0)
  )
  
  const repayValidation = validateAmount(
    repayAmount, 
    userPosition?.borrowed || BigInt(0)
  )

  const handleBorrow = async () => {
    if (borrowValidation.isValid && borrowAmount && hasCollateral) {
      await onBorrow(borrowAmount)
      setBorrowAmount('')
    }
  }

  const handleRepay = async () => {
    if (repayValidation.isValid && repayAmount && hasDebt) {
      await onRepay(repayAmount)
      setRepayAmount('')
    }
  }

  const setMaxBorrow = () => {
    if (userPosition) {
      setBorrowAmount(formatBalance(userPosition.maxBorrowAmount))
    }
  }

  const setMaxRepay = () => {
    if (userPosition) {
      setRepayAmount(formatBalance(userPosition.borrowed))
    }
  }

  const currentHealthFactor = userPosition 
    ? calculateHealthFactor(userPosition.maxBorrowAmount, userPosition.borrowed)
    : Infinity

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Borrow & Repay WOORT</h3>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('borrow')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'borrow'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Borrow</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('repay')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'repay'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Repay</span>
            </div>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {txState.error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{txState.error}</span>
          </div>
        </div>
      )}

      {/* Collateral Warning */}
      {!hasCollateral && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              You need to deposit OORT nodes as collateral before you can borrow. Visit the "My Nodes" section to deposit your nodes.
            </span>
          </div>
        </div>
      )}

      {activeTab === 'borrow' ? (
        /* Borrow Tab */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount to Borrow</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="input pr-20"
                  disabled={!hasCollateral}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-gray-400 font-medium">WOORT</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  Available: {userPosition ? formatBalance(userPosition.maxBorrowAmount) : '0'} WOORT
                </span>
                <button
                  onClick={setMaxBorrow}
                  className="text-primary-400 hover:text-primary-300 font-medium disabled:opacity-50"
                  disabled={!hasCollateral}
                >
                  Max
                </button>
              </div>
            </div>
            {!borrowValidation.isValid && borrowAmount && (
              <div className="text-sm text-red-400 mt-2 p-2 bg-red-900/10 rounded">
                {borrowValidation.error}
              </div>
            )}
          </div>

          <button
            onClick={handleBorrow}
            disabled={!borrowValidation.isValid || !borrowAmount || !hasCollateral || txState.isLoading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txState.isLoading ? 'Borrowing...' : 'Borrow WOORT'}
          </button>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Borrow APY:</span>
                <span className="font-medium text-gray-300">
                  {protocolStats ? formatAPY(protocolStats.borrowAPY) : '-.-%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Your debt:</span>
                <span className="font-medium text-gray-300">
                  {userPosition ? formatBalance(userPosition.borrowed) : '0'} WOORT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Health Factor:</span>
                <span className={`font-medium ${currentHealthFactor < 1.5 ? 'text-red-400' : 'text-green-400'}`}>
                  {currentHealthFactor === Infinity ? '∞' : currentHealthFactor.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Repay Tab */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount to Repay</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="input pr-20"
                  disabled={!hasDebt}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-gray-400 font-medium">WOORT</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  Balance: {userPosition ? formatBalance(userPosition.woortBalance) : '0'} WOORT
                </span>
                <button
                  onClick={setMaxRepay}
                  className="text-primary-400 hover:text-primary-300 font-medium disabled:opacity-50"
                  disabled={!hasDebt}
                >
                  Max
                </button>
              </div>
            </div>
            {!repayValidation.isValid && repayAmount && (
              <div className="text-sm text-red-400 mt-2 p-2 bg-red-900/10 rounded">
                {repayValidation.error}
              </div>
            )}
          </div>

          <button
            onClick={handleRepay}
            disabled={!repayValidation.isValid || !repayAmount || !hasDebt || txState.isLoading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txState.isLoading ? 'Repaying...' : 'Repay WOORT'}
          </button>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Total debt:</span>
                <span className="font-medium text-gray-300">
                  {userPosition ? formatBalance(userPosition.borrowed) : '0'} WOORT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}