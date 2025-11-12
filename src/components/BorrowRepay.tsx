'use client'

import { useState } from 'react'
import { UserPosition, ProtocolStats, TransactionState, TransactionFunction } from '@/types/contracts'
import { formatBalance, validateAmount } from '@/lib/utils'
import { CreditCard, RefreshCw, AlertCircle, Info } from 'lucide-react'

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

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Borrow & Repay OORT</h3>
        
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

      {/* Transaction Progress Bar */}
      {txState.isLoading && txState.currentStep && txState.totalSteps && (
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-300 font-medium">{txState.stepDescription}</span>
              <span className="text-blue-400">
                Step {txState.currentStep} of {txState.totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(txState.currentStep / txState.totalSteps) * 100}%` }}
              />
            </div>
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
                  <span className="text-sm text-gray-400 font-medium">OORT</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">
                    Available: {userPosition ? formatBalance(userPosition.maxBorrowAmount) : '0'} OORT
                  </span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                      <div className="text-left">
                        <p className="font-semibold mb-1">Max Borrow Calculation:</p>
                        <p className="text-gray-300">Min of:</p>
                        <p className="text-gray-300 ml-2">1. Collateral Value × Max LTV - Current Debt</p>
                        <p className="text-gray-300 ml-2">2. Available Pool Liquidity</p>
                        {userPosition && protocolStats && (
                          <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                            <p>Collateral Limit: {formatBalance(userPosition.collateralValue)} × {(protocolStats.maxLTV / 100).toFixed(0)}% - {formatBalance(userPosition.borrowed)}</p>
                            <p className="font-semibold text-white mt-1">Final: {formatBalance(userPosition.maxBorrowAmount)} OORT</p>
                            <p className="text-xs text-gray-500 mt-1">(Limited by available liquidity or collateral)</p>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
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
            {txState.isLoading && txState.operation === 'borrow' ? 'Borrowing...' : 'Borrow OORT'}
          </button>
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
                  <span className="text-sm text-gray-400 font-medium">OORT</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">
                    Total debt: {userPosition ? formatBalance(userPosition.borrowed) : '0'} OORT
                  </span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                      <div className="text-left">
                        <p className="font-semibold mb-1">Repayment:</p>
                        <p className="text-gray-300">You can repay up to your total debt</p>
                        {userPosition && (
                          <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
                            <p>Principal: {formatBalance(userPosition.borrowed - userPosition.borrowInterest)}</p>
                            <p>Interest: {formatBalance(userPosition.borrowInterest)}</p>
                            <p className="font-semibold text-white mt-1">Total: {formatBalance(userPosition.borrowed)}</p>
                            <p className="mt-2 text-xs text-gray-500">Your balance: {formatBalance(userPosition.oortBalance)}</p>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
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
            {txState.isLoading && txState.operation === 'repay' ? 'Repaying...' : 'Repay OORT'}
          </button>
        </div>
      )}
    </div>
  )
}