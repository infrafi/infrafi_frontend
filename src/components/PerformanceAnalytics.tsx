'use client'

import { useUserPosition, useUserTimeline } from '@/hooks/useSubgraph'
import { formatBalance } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Award, BarChart3, PieChart } from 'lucide-react'

interface PerformanceAnalyticsProps {
  address: string | null
}

export function PerformanceAnalytics({ address }: PerformanceAnalyticsProps) {
  const { userPosition, isLoading: positionLoading } = useUserPosition(address)
  const { supplyEvents, withdrawEvents, borrowEvents, repayEvents, isLoading: eventsLoading } = useUserTimeline(address)

  if (!address) {
    return null
  }

  const isLoading = positionLoading || eventsLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <p className="text-gray-400">No performance data available</p>
      </div>
    )
  }

  // Calculate performance metrics
  const totalSupplied = BigInt(userPosition.totalSupplied || 0)
  const totalBorrowed = BigInt(userPosition.totalBorrowed || 0)
  const supplyInterest = BigInt(userPosition.totalSupplyInterest || 0)
  const borrowInterest = BigInt(userPosition.totalBorrowInterest || 0)
  const collateralValue = BigInt(userPosition.collateralValue || 0)

  // Net profit/loss
  const netProfitLoss = supplyInterest - borrowInterest
  const isProfitable = netProfitLoss >= 0n

  // Calculate total capital deployed (all assets put into protocol)
  const totalCapitalDeployed = totalSupplied + collateralValue
  
  // ROI calculation (net profit / capital deployed * 100)
  const roi = totalCapitalDeployed > 0n 
    ? (Number(netProfitLoss) / Number(totalCapitalDeployed)) * 100 
    : 0

  // Net worth = assets - debts
  const totalAssets = totalSupplied + supplyInterest + collateralValue
  const totalDebts = totalBorrowed + borrowInterest
  const netWorth = totalAssets - totalDebts

  // Leverage ratio = total assets / equity
  const equity = totalAssets - totalDebts
  const leverageRatio = equity > 0n ? Number(totalAssets) / Number(equity) : 1

  // Capital efficiency = borrowed / collateral (how much you're borrowing against collateral)
  const capitalEfficiency = collateralValue > 0n 
    ? (Number(totalBorrowed) / Number(collateralValue)) * 100 
    : 0

  // Activity metrics
  const totalTransactions = supplyEvents.length + withdrawEvents.length + borrowEvents.length + repayEvents.length
  const totalSupplyVolume = supplyEvents.reduce((sum: bigint, e: any) => sum + BigInt(e.amount || 0), 0n)
  const totalBorrowVolume = borrowEvents.reduce((sum: bigint, e: any) => sum + BigInt(e.amount || 0), 0n)

  // Determine user strategy
  const getStrategyType = () => {
    if (totalBorrowed === 0n && totalSupplied > 0n) return 'Conservative Lender'
    if (totalBorrowed > 0n && collateralValue > 0n) return 'Leveraged Borrower'
    if (totalBorrowed > 0n && totalSupplied > 0n) return 'Active Trader'
    return 'Inactive'
  }

  const strategyType = getStrategyType()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900/30 to-gray-800 rounded-lg p-4 border border-primary-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Performance Overview</h3>
            <p className="text-sm text-gray-400">Your financial metrics and strategy analysis</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Strategy Type</p>
            <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-medium">
              {strategyType}
            </span>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Net Profit/Loss */}
        <div className={`rounded-lg p-4 border ${
          isProfitable 
            ? 'bg-gradient-to-br from-green-900/20 to-gray-800 border-green-900/30' 
            : 'bg-gradient-to-br from-red-900/20 to-gray-800 border-red-900/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Net Profit/Loss</p>
            {isProfitable ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
            {isProfitable ? '+' : ''}{formatBalance(netProfitLoss)} WOORT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Interest Earned: {formatBalance(supplyInterest)} | Paid: {formatBalance(borrowInterest)}
          </p>
        </div>

        {/* ROI Percentage */}
        <div className="bg-gradient-to-br from-blue-900/20 to-gray-800 rounded-lg p-4 border border-blue-900/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Return on Investment</p>
            <Percent className="w-5 h-5 text-blue-400" />
          </div>
          <p className={`text-2xl font-bold ${roi >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(8)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Capital Deployed: {formatBalance(totalCapitalDeployed)} WOORT
          </p>
        </div>

        {/* Net Worth */}
        <div className="bg-gradient-to-br from-purple-900/20 to-gray-800 rounded-lg p-4 border border-purple-900/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Net Worth</p>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {formatBalance(netWorth)} WOORT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Assets: {formatBalance(totalAssets)} | Debts: {formatBalance(totalDebts)}
          </p>
        </div>

        {/* Leverage Ratio */}
        <div className="bg-gradient-to-br from-orange-900/20 to-gray-800 rounded-lg p-4 border border-orange-900/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Leverage Ratio</p>
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {leverageRatio.toFixed(8)}x
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {leverageRatio < 1.5 ? 'Low leverage' : leverageRatio < 2.5 ? 'Moderate' : 'High leverage'}
          </p>
        </div>

        {/* Capital Efficiency */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-gray-800 rounded-lg p-4 border border-cyan-900/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Capital Efficiency</p>
            <PieChart className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {capitalEfficiency.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Borrowed vs Collateral
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-gray-800 rounded-lg p-4 border border-indigo-900/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Activity</p>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {totalTransactions}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Transactions executed
          </p>
        </div>
      </div>

      {/* Volume Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supply Volume */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-green-400 mb-3">Supply Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Supplied</span>
              <span className="text-sm font-medium text-white">
                {formatBalance(totalSupplyVolume)} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Supply Transactions</span>
              <span className="text-sm font-medium text-white">
                {supplyEvents.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Avg per Transaction</span>
              <span className="text-sm font-medium text-white">
                {supplyEvents.length > 0 
                  ? formatBalance(totalSupplyVolume / BigInt(supplyEvents.length))
                  : '0'} WOORT
              </span>
            </div>
          </div>
        </div>

        {/* Borrow Volume */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-orange-400 mb-3">Borrow Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Total Borrowed</span>
              <span className="text-sm font-medium text-white">
                {formatBalance(totalBorrowVolume)} WOORT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Borrow Transactions</span>
              <span className="text-sm font-medium text-white">
                {borrowEvents.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Avg per Transaction</span>
              <span className="text-sm font-medium text-white">
                {borrowEvents.length > 0 
                  ? formatBalance(totalBorrowVolume / BigInt(borrowEvents.length))
                  : '0'} WOORT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-start space-x-3">
          <Award className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-2">Performance Insights</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {isProfitable ? (
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Your strategy is profitable with a net gain of {formatBalance(netProfitLoss)} WOORT</span>
                </li>
              ) : (
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">!</span>
                  <span>Currently showing a net loss of {formatBalance(netProfitLoss)} WOORT from interest costs</span>
                </li>
              )}
              
              {roi > 5 ? (
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Strong ROI of {roi.toFixed(8)}% - your capital is working efficiently</span>
                </li>
              ) : roi > 0 ? (
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span>Moderate ROI of {roi.toFixed(8)}% - consider optimizing your positions</span>
                </li>
              ) : (
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">!</span>
                  <span>Negative ROI - review your borrowing costs and collateral utilization</span>
                </li>
              )}
              
              {leverageRatio > 2.5 ? (
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">!</span>
                  <span>High leverage ratio of {leverageRatio.toFixed(8)}x - monitor your health factor closely</span>
                </li>
              ) : (
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Conservative leverage at {leverageRatio.toFixed(8)}x - room for growth if desired</span>
                </li>
              )}
              
              {capitalEfficiency < 50 && collateralValue > 0n ? (
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  <span>Collateral utilization at {capitalEfficiency.toFixed(0)}% - opportunity to borrow more if needed</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

