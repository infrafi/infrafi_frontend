'use client'

import { useUserPosition, useUserTimeline } from '@/hooks/useSubgraph'
import { useInfraFi } from '@/hooks/useInfraFi'
import { formatBalance } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { UserPerformanceChart } from './UserPerformanceChart'

interface UserAnalyticsProps {
  address: string | null
}

export function UserAnalytics({ address }: UserAnalyticsProps) {
  const { userPosition, isLoading: positionLoading } = useUserPosition(address)
  const { supplyEvents, withdrawEvents, borrowEvents, repayEvents, isLoading: eventsLoading } = useUserTimeline(address)
  const { userPosition: realTimeUserPosition } = useInfraFi()

  if (!address) {
    return null
  }

  const isLoading = positionLoading || eventsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!userPosition) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    )
  }

  // Use real-time interest from useInfraFi if available, otherwise fall back to GraphQL data
  const totalInterestEarned = realTimeUserPosition?.supplyInterest || BigInt(userPosition.totalSupplyInterest || 0)
  const totalInterestOwed = realTimeUserPosition?.borrowInterest || BigInt(userPosition.totalBorrowInterest || 0)
  const netInterest = totalInterestEarned - totalInterestOwed
  const isNetPositive = netInterest >= 0n

  const memberSince = userPosition.firstInteractionTimestamp 
    ? new Date(Number(userPosition.firstInteractionTimestamp) * 1000).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'N/A'

  const daysSinceMember = userPosition.firstInteractionTimestamp
    ? Math.floor((Date.now() / 1000 - Number(userPosition.firstInteractionTimestamp)) / 86400)
    : 0

  const totalSupplied = BigInt(userPosition.totalSupplied || 0)
  const totalBorrowed = BigInt(userPosition.totalBorrowed || 0)
  const collateralValue = BigInt(userPosition.collateralValue || 0)
  
  const totalAssets = totalSupplied + totalInterestEarned + collateralValue
  const totalDebts = totalBorrowed + totalInterestOwed
  const netWorth = totalAssets - totalDebts

  // Calculate effective APY
  const calculateAPY = (interest: bigint, principal: bigint, days: number): string => {
    if (principal === 0n || days === 0) return '0.00'
    const interestRate = Number(interest) / Number(principal)
    const annualized = interestRate * (365 / days) * 100
    return annualized.toFixed(2)
  }

  const supplyAPY = calculateAPY(totalInterestEarned, totalSupplied, daysSinceMember)
  const borrowAPY = calculateAPY(totalInterestOwed, totalBorrowed, daysSinceMember)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900/30 to-gray-800 rounded-lg p-4 border border-primary-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Your Analytics</h3>
            <p className="text-sm text-gray-400">Member since {memberSince} ({daysSinceMember} days)</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Account Type</p>
            <div className="space-x-1">
              {userPosition.isLender && (
                <span className="inline-block px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-medium">
                  Lender
                </span>
              )}
              {userPosition.isBorrower && (
                <span className="inline-block px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs font-medium">
                  Borrower
                </span>
              )}
              {!userPosition.isLender && !userPosition.isBorrower && (
                <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs font-medium">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Net Worth */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Net Worth</p>
            <DollarSign className="w-5 h-5 text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {formatBalance(netWorth)} WOORT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Assets: {formatBalance(totalAssets)} | Debts: {formatBalance(totalDebts)}
          </p>
        </div>

        {/* Net Interest */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Net Interest</p>
            {isNetPositive ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${isNetPositive ? 'text-green-400' : 'text-red-400'}`}>
            {formatBalance(netInterest)} WOORT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Earned: {formatBalance(totalInterestEarned)} | Owed: {formatBalance(totalInterestOwed)}
          </p>
        </div>
      </div>

      {/* Position Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supply Position */}
        <div className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-lg p-4 border border-green-900/30">
          <h4 className="text-sm font-semibold text-green-400 mb-3">Supply Position</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Supplied</span>
              <span className="text-sm font-medium text-white">
                {formatBalance(totalSupplied)} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Interest Earned</span>
              <span className="text-sm font-medium text-green-400">
                +{formatBalance(totalInterestEarned)} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Effective APY</span>
              <span className="text-sm font-medium text-green-400">
                {supplyAPY}%
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-300">Total Value</span>
                <span className="text-sm font-bold text-white">
                  {formatBalance(totalSupplied + totalInterestEarned)} WOORT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Borrow Position */}
        <div className="bg-gradient-to-br from-orange-900/20 to-gray-800 rounded-lg p-4 border border-orange-900/30">
          <h4 className="text-sm font-semibold text-orange-400 mb-3">Borrow Position</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Borrowed</span>
              <span className="text-sm font-medium text-white">
                {formatBalance(totalBorrowed)} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Interest Owed</span>
              <span className="text-sm font-medium text-orange-400">
                +{formatBalance(totalInterestOwed)} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Effective APR</span>
              <span className="text-sm font-medium text-orange-400">
                {borrowAPY}%
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-300">Total Debt</span>
                <span className="text-sm font-bold text-white">
                  {formatBalance(totalDebts)} WOORT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collateral Position */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-gray-800 rounded-lg p-4 border border-cyan-900/30">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Collateral Position</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Nodes Deposited</span>
              <span className="text-sm font-medium text-white">
                {userPosition.depositedNodesCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Value</span>
              <span className="text-sm font-medium text-cyan-400">
                {formatBalance(collateralValue)} WOORT
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-300">Avg per Node</span>
                <span className="text-sm font-bold text-white">
                  {userPosition.depositedNodesCount > 0
                    ? formatBalance(collateralValue / BigInt(userPosition.depositedNodesCount))
                    : '0'} WOORT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance History Chart */}
      <UserPerformanceChart address={address} />
    </div>
  )
}

