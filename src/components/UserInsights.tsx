'use client'

import { useUserPosition } from '@/hooks/useSubgraph'
import { formatBalance } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Server, Calendar, Percent } from 'lucide-react'
import { UserPerformanceChart } from './UserPerformanceChart'

interface UserInsightsProps {
  address: string | null
}

export function UserInsights({ address }: UserInsightsProps) {
  const { userPosition, isLoading, error } = useUserPosition(address)

  if (!address) {
    return null
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Failed to load insights: {error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!userPosition) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No activity data available</p>
      </div>
    )
  }

  const totalInterestEarned = BigInt(userPosition.totalSupplyInterest || 0)
  const totalInterestPaid = BigInt(userPosition.totalBorrowInterest || 0)
  const netInterest = totalInterestEarned - totalInterestPaid
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

  const totalValue = BigInt(userPosition.totalSupplied) + BigInt(userPosition.collateralValue)
  const totalDebt = BigInt(userPosition.totalBorrowed) + BigInt(userPosition.totalBorrowInterest)
  const netWorth = totalValue - totalDebt

  // Calculate effective APY based on time and interest
  const calculateAPY = (interest: bigint, principal: bigint, days: number): string => {
    if (principal === 0n || days === 0) return '0.00'
    
    // APY = (Interest / Principal) * (365 / Days) * 100
    const interestRate = Number(interest) / Number(principal)
    const annualized = interestRate * (365 / days) * 100
    
    return annualized.toFixed(8)
  }

  const supplyAPY = calculateAPY(totalInterestEarned, BigInt(userPosition.totalSupplied), daysSinceMember)
  const borrowAPY = calculateAPY(totalInterestPaid, BigInt(userPosition.totalBorrowed), daysSinceMember)

  return (
    <div className="space-y-6">
      {/* Member Info */}
      <div className="text-center">
        <p className="text-sm text-gray-400">Member since {memberSince} ({daysSinceMember} days)</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {isNetPositive ? '+' : ''}{formatBalance(netInterest)} WOORT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Earned: {formatBalance(totalInterestEarned)} | Paid: {formatBalance(totalInterestPaid)}
          </p>
        </div>

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
            Assets - Debt
          </p>
        </div>

        {/* Collateral Ratio */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Collateral Ratio</p>
            <Percent className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {totalDebt > 0n 
              ? ((Number(userPosition.collateralValue) / Number(totalDebt)) * 100).toFixed(0)
              : '∞'
            }%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {userPosition.depositedNodesCount} nodes deposited
          </p>
        </div>

        {/* Account Type */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Account Type</p>
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="space-y-1">
            {userPosition.isLender && (
              <span className="inline-block px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-medium">
                Lender
              </span>
            )}
            {userPosition.isBorrower && (
              <span className="inline-block px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs font-medium ml-1">
                Borrower
              </span>
            )}
            {!userPosition.isLender && !userPosition.isBorrower && (
              <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs font-medium">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last activity: {new Date(Number(userPosition.lastInteractionTimestamp) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supply Position */}
        <div className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-lg p-4 border border-green-900/30">
          <h4 className="text-sm font-semibold text-green-400 mb-3">Supply Position</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Supplied</span>
              <span className="text-sm font-medium text-white">
                {formatBalance(BigInt(userPosition.totalSupplied))} WOORT
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
                  {formatBalance(BigInt(userPosition.totalSupplied) + totalInterestEarned)} WOORT
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
                {formatBalance(BigInt(userPosition.totalBorrowed))} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Interest Accrued</span>
              <span className="text-sm font-medium text-orange-400">
                +{formatBalance(totalInterestPaid)} WOORT
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
                  {formatBalance(totalDebt)} WOORT
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
                {formatBalance(BigInt(userPosition.collateralValue))} WOORT
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-300">Avg per Node</span>
                <span className="text-sm font-bold text-white">
                  {userPosition.depositedNodesCount > 0
                    ? formatBalance(BigInt(userPosition.collateralValue) / BigInt(userPosition.depositedNodesCount))
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

