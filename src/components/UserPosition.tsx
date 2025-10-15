'use client'

import { UserPosition as UserPositionType } from '@/types/contracts'
import { formatBalance, calculateHealthFactor } from '@/lib/utils'
import { DollarSign, Wallet, CreditCard, Package, AlertTriangle, AlertCircle } from 'lucide-react'

interface UserPositionProps {
  userPosition: UserPositionType | null
  isLoading: boolean
}

export function UserPosition({ userPosition, isLoading }: UserPositionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const healthFactor = userPosition 
    ? calculateHealthFactor(userPosition.collateralValue, userPosition.borrowed, 80)
    : Infinity

  const borrowed = userPosition ? BigInt(userPosition.borrowed) : 0n
  const hasDebt = borrowed > 0n
  
  // Health factor thresholds
  const isCritical = hasDebt && healthFactor < 1.1
  const isWarning = hasDebt && healthFactor >= 1.1 && healthFactor < 1.3
  const showAlert = isCritical || isWarning

  return (
    <div className="space-y-6">
      {/* Liquidation Warning Banner */}
      {showAlert && (
        <div className={`rounded-lg p-4 border ${
          isCritical 
            ? 'bg-red-900/30 border-red-500' 
            : 'bg-yellow-900/30 border-yellow-500'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isCritical ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${
                isCritical ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {isCritical ? '🚨 Critical: Liquidation Risk!' : '⚠️ Warning: Low Health Factor'}
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                {isCritical 
                  ? `Your health factor is ${healthFactor.toFixed(2)}. You are at high risk of liquidation!`
                  : `Your health factor is ${healthFactor.toFixed(2)}. Consider repaying debt or adding collateral.`
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Current Health Factor</p>
                  <p className={`font-bold ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                    {healthFactor.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Safe Threshold</p>
                  <p className="font-bold text-green-400">≥ 1.30</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Liquidation Point</p>
                  <p className="font-bold text-red-400">{'< 1.00'}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Recommended actions:</p>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>Repay part of your debt to increase health factor</li>
                  <li>Deposit more node collateral to increase your position</li>
                  <li>Monitor your position closely to avoid liquidation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Position Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* WOORT Balance */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-600 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">WOORT Balance</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? formatBalance(userPosition.woortBalance) : '0'}
            </p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
        </div>
      </div>

      {/* Supplied */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-600 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Supplied</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? formatBalance(userPosition.supplied) : '0'}
            </p>
            <p className="text-xs text-gray-500">
              Interest: {userPosition ? formatBalance(userPosition.supplyInterest) : '0'} WOORT
            </p>
          </div>
        </div>
      </div>

      {/* Deposited Nodes */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Nodes Deposited</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? userPosition.depositedNodesCount : '0'}
            </p>
            <p className="text-xs text-gray-500">
              Collateral: {userPosition ? formatBalance(userPosition.collateralValue) : '0'} WOORT
            </p>
          </div>
        </div>
      </div>

      {/* Borrowed */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-600 rounded-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Borrowed</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? formatBalance(userPosition.borrowed) : '0'}
            </p>
            <p className="text-xs text-gray-500">
              Interest: {userPosition ? formatBalance(userPosition.borrowInterest) : '0'} • Health: {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
