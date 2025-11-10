'use client'

import { UserPosition as UserPositionType, ProtocolStats } from '@/types/contracts'
import { formatBalance, formatTokenAmount, calculateLTV } from '@/lib/utils'
import { DollarSign, Wallet, CreditCard, Package, AlertTriangle, AlertCircle } from 'lucide-react'

interface UserPositionProps {
  userPosition: UserPositionType | null
  protocolStats: ProtocolStats | null
  isLoading: boolean
}

export function UserPosition({ userPosition, protocolStats, isLoading }: UserPositionProps) {
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

  const ltv = userPosition 
    ? calculateLTV(userPosition.collateralValue, userPosition.borrowed)
    : 0

  const borrowed = userPosition ? BigInt(userPosition.borrowed) : 0n
  const hasDebt = borrowed > 0n
  
  // Get maxLTV and liquidation threshold from on-chain (in basis points), convert to percentage
  const maxLTVPercent = protocolStats?.maxLTV ? protocolStats.maxLTV / 100 : 75
  const liquidationThreshold = protocolStats?.liquidationThreshold ? protocolStats.liquidationThreshold / 100 : 80
  
  // LTV thresholds (higher LTV = more risk)
  // Warn at 90% of maxLTV, critical at 98% of maxLTV
  const warningThreshold = maxLTVPercent * 0.90
  const criticalThreshold = maxLTVPercent * 0.98
  const isCritical = hasDebt && ltv >= criticalThreshold
  const isWarning = hasDebt && ltv >= warningThreshold && ltv < criticalThreshold
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
                {isCritical ? '🚨 Critical: Liquidation Risk!' : '⚠️ Warning: High LTV Ratio'}
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                {isCritical 
                  ? `Your LTV is ${ltv.toFixed(2)}%. You are at high risk of liquidation!`
                  : `Your LTV is ${ltv.toFixed(2)}%. Consider repaying debt or adding collateral.`
                }
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Current LTV</p>
                  <p className={`font-bold ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                    {ltv.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Safe Threshold</p>
                  <p className="font-bold text-green-400">{'< '}{warningThreshold.toFixed(0)}%</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Maximum LTV</p>
                  <p className="font-bold text-orange-400">{maxLTVPercent.toFixed(0)}%</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Liquidation</p>
                  <p className="font-bold text-red-400">{liquidationThreshold.toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Recommended actions:</p>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>Repay part of your debt to reduce your LTV ratio</li>
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
              Interest: {userPosition ? formatTokenAmount(userPosition.supplyInterest) : '0.000000000000000000'} WOORT
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
              {userPosition ? formatBalance(userPosition.borrowed - userPosition.borrowInterest) : '0'}
            </p>
            <p className="text-xs text-gray-500">
              Interest: {userPosition ? formatTokenAmount(userPosition.borrowInterest) : '0.000000000000000000'} • LTV: {ltv.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
