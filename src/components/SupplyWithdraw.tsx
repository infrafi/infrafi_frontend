'use client'

import { useState } from 'react'
import { UserPosition, ProtocolStats, TransactionState, TransactionFunction } from '@/types/contracts'
import { formatBalance, formatAPY, validateAmount } from '@/lib/utils'
import { Plus, Minus, AlertCircle } from 'lucide-react'

interface SupplyWithdrawProps {
  userPosition: UserPosition | null
  protocolStats: ProtocolStats | null
  txState: TransactionState
  onSupply: TransactionFunction
  onWithdraw: TransactionFunction
}

export function SupplyWithdraw({ userPosition, protocolStats, txState, onSupply, onWithdraw }: SupplyWithdrawProps) {
  const [activeTab, setActiveTab] = useState<'supply' | 'withdraw'>('supply')
  const [supplyAmount, setSupplyAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const supplyValidation = validateAmount(
    supplyAmount, 
    userPosition?.woortBalance || BigInt(0)
  )
  
  const withdrawValidation = validateAmount(
    withdrawAmount, 
    userPosition?.supplied || BigInt(0)
  )

  const handleSupply = async () => {
    if (supplyValidation.isValid && supplyAmount) {
      await onSupply(supplyAmount)
      setSupplyAmount('')
    }
  }

  const handleWithdraw = async () => {
    if (withdrawValidation.isValid && withdrawAmount) {
      await onWithdraw(withdrawAmount)
      setWithdrawAmount('')
    }
  }

  const setMaxSupply = () => {
    if (userPosition) {
      setSupplyAmount(formatBalance(userPosition.woortBalance))
    }
  }

  const setMaxWithdraw = () => {
    if (userPosition) {
      setWithdrawAmount(formatBalance(userPosition.supplied))
    }
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Supply & Withdraw WOORT</h3>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('supply')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'supply'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Supply</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Minus className="w-4 h-4" />
              <span>Withdraw</span>
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

      {activeTab === 'supply' ? (
        /* Supply Tab */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount to Supply</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={supplyAmount}
                  onChange={(e) => setSupplyAmount(e.target.value)}
                  className="input pr-20"
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
                  onClick={setMaxSupply}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Max
                </button>
              </div>
            </div>
            {!supplyValidation.isValid && supplyAmount && (
              <div className="text-sm text-red-400 mt-2 p-2 bg-red-900/10 rounded">
                {supplyValidation.error}
              </div>
            )}
          </div>

          <button
            onClick={handleSupply}
            disabled={!supplyValidation.isValid || !supplyAmount || txState.isLoading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txState.isLoading ? 'Supplying...' : 'Supply WOORT'}
          </button>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Current APY:</span>
                <span className="font-medium text-gray-300">
                  {protocolStats ? formatAPY(protocolStats.supplyAPY) : '-.-%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Your supplied:</span>
                <span className="font-medium text-gray-300">
                  {userPosition ? formatBalance(userPosition.supplied) : '0'} WOORT
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Withdraw Tab */
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount to Withdraw</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="input pr-20"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-gray-400 font-medium">WOORT</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  Supplied: {userPosition ? formatBalance(userPosition.supplied) : '0'} WOORT
                </span>
                <button
                  onClick={setMaxWithdraw}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Max
                </button>
              </div>
            </div>
            {!withdrawValidation.isValid && withdrawAmount && (
              <div className="text-sm text-red-400 mt-2 p-2 bg-red-900/10 rounded">
                {withdrawValidation.error}
              </div>
            )}
          </div>

          <button
            onClick={handleWithdraw}
            disabled={!withdrawValidation.isValid || !withdrawAmount || txState.isLoading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txState.isLoading ? 'Withdrawing...' : 'Withdraw WOORT'}
          </button>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex justify-between items-center">
                <span>Available to withdraw:</span>
                <span className="font-medium text-gray-300">
                  {userPosition ? formatBalance(userPosition.supplied) : '0'} WOORT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}