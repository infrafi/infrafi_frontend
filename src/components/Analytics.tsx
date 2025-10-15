'use client'

import { useState, useMemo } from 'react'
import { useDailySnapshots, useProtocolStats, useEventsInRange, useInterestRateHistory } from '@/hooks/useSubgraph'
import { 
  formatTVLChartData, 
  formatAPYChartData, 
  formatActivityChartData, 
  formatVolumeChartData,
  formatInterestRateChartData,
  formatIndexChartData
} from '@/lib/chart-utils'
import { TVLChart } from './TVLChart'
import { APYChart } from './APYChart'
import { IndexChart } from './IndexChart'
import { ActivityChart } from './ActivityChart'
import { VolumeChart } from './VolumeChart'
import { TrendingUp } from 'lucide-react'

export function Analytics() {
  const [days, setDays] = useState(30)
  const { snapshots, isLoading, error } = useDailySnapshots(days)
  const { protocolStats: currentProtocol } = useProtocolStats()
  
  // Fetch high-frequency interest rate snapshots for APY chart (more granular data)
  // This gives us data points for every rate change, not just daily
  const dataPointsNeeded = days * 10 // Approximate: ~10 data points per day
  const { snapshots: rateSnapshots, isLoading: rateLoading } = useInterestRateHistory(dataPointsNeeded)
  
  // Calculate start time for event fetching (based on days selected)
  const startTime = useMemo(() => {
    return Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60)
  }, [days])
  
  // Fetch events in the time range
  const { events, isLoading: eventsLoading } = useEventsInRange(startTime)

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Failed to load analytics data: {error}</p>
      </div>
    )
  }

  if (isLoading || rateLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-80 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // Format historical data and append current state
  const tvlData = formatTVLChartData(snapshots, currentProtocol)
  
  // Use high-frequency rate snapshots for APY chart (better event matching)
  // Filter to only show data within the selected time range
  const apyData = formatInterestRateChartData(rateSnapshots, startTime)
  
  // Format index chart data (borrow/supply indices)
  const indexData = formatIndexChartData(rateSnapshots, startTime)
  
  const activityData = formatActivityChartData(snapshots)
  const volumeData = formatVolumeChartData(snapshots)

  // Calculate comparison metrics (current period vs previous period)
  const getComparisonMetrics = () => {
    if (snapshots.length === 0) return null

    const midpoint = Math.floor(snapshots.length / 2)
    const recentPeriod = snapshots.slice(0, midpoint)
    const previousPeriod = snapshots.slice(midpoint)

    if (recentPeriod.length === 0 || previousPeriod.length === 0) return null

    // Average metrics for each period
    const avgRecent = {
      supplied: recentPeriod.reduce((sum: number, s: any) => sum + Number(s.totalSupplied), 0) / recentPeriod.length / 1e18,
      borrowed: recentPeriod.reduce((sum: number, s: any) => sum + Number(s.totalBorrowed), 0) / recentPeriod.length / 1e18,
      utilization: recentPeriod.reduce((sum: number, s: any) => {
        const rate = typeof s.utilizationRate === 'string' ? parseInt(s.utilizationRate) : Number(s.utilizationRate)
        return sum + rate
      }, 0) / recentPeriod.length / 100,
      supplyAPY: recentPeriod.reduce((sum: number, s: any) => {
        const apy = typeof s.supplyAPY === 'string' ? parseInt(s.supplyAPY) : Number(s.supplyAPY)
        return sum + apy
      }, 0) / recentPeriod.length / 100,
    }

    const avgPrevious = {
      supplied: previousPeriod.reduce((sum: number, s: any) => sum + Number(s.totalSupplied), 0) / previousPeriod.length / 1e18,
      borrowed: previousPeriod.reduce((sum: number, s: any) => sum + Number(s.totalBorrowed), 0) / previousPeriod.length / 1e18,
      utilization: previousPeriod.reduce((sum: number, s: any) => {
        const rate = typeof s.utilizationRate === 'string' ? parseInt(s.utilizationRate) : Number(s.utilizationRate)
        return sum + rate
      }, 0) / previousPeriod.length / 100,
      supplyAPY: previousPeriod.reduce((sum: number, s: any) => {
        const apy = typeof s.supplyAPY === 'string' ? parseInt(s.supplyAPY) : Number(s.supplyAPY)
        return sum + apy
      }, 0) / previousPeriod.length / 100,
    }

    // Calculate percentage changes
    const changes = {
      supplied: avgPrevious.supplied > 0 ? ((avgRecent.supplied - avgPrevious.supplied) / avgPrevious.supplied) * 100 : 0,
      borrowed: avgPrevious.borrowed > 0 ? ((avgRecent.borrowed - avgPrevious.borrowed) / avgPrevious.borrowed) * 100 : 0,
      utilization: avgRecent.utilization - avgPrevious.utilization,
      supplyAPY: avgRecent.supplyAPY - avgPrevious.supplyAPY,
    }

    return { avgRecent, avgPrevious, changes }
  }

  const comparison = getComparisonMetrics()

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex justify-end">
        <div className="flex space-x-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Period Comparison */}
      {comparison && (
        <div className="bg-gradient-to-r from-blue-900/20 to-gray-800 rounded-lg p-4 border border-blue-900/30">
          <h3 className="text-lg font-bold text-white mb-4">Period Comparison</h3>
          <p className="text-sm text-gray-400 mb-4">
            Comparing recent {Math.floor(days/2)} days vs previous {Math.floor(days/2)} days
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Supplied Change */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Total Supplied</p>
              <p className="text-lg font-bold text-white mb-1">
                {comparison.avgRecent.supplied.toFixed(8)} WOORT
              </p>
              <div className={`flex items-center text-sm ${
                comparison.changes.supplied >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  comparison.changes.supplied < 0 ? 'rotate-180' : ''
                }`} />
                <span>
                  {comparison.changes.supplied >= 0 ? '+' : ''}{comparison.changes.supplied.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Total Borrowed Change */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Total Borrowed</p>
              <p className="text-lg font-bold text-white mb-1">
                {comparison.avgRecent.borrowed.toFixed(8)} WOORT
              </p>
              <div className={`flex items-center text-sm ${
                comparison.changes.borrowed >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  comparison.changes.borrowed < 0 ? 'rotate-180' : ''
                }`} />
                <span>
                  {comparison.changes.borrowed >= 0 ? '+' : ''}{comparison.changes.borrowed.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Utilization Change */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Utilization Rate</p>
              <p className="text-lg font-bold text-white mb-1">
                {comparison.avgRecent.utilization.toFixed(8)}%
              </p>
              <div className={`flex items-center text-sm ${
                comparison.changes.utilization >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  comparison.changes.utilization < 0 ? 'rotate-180' : ''
                }`} />
                <span>
                  {comparison.changes.utilization >= 0 ? '+' : ''}{comparison.changes.utilization.toFixed(8)}%
                </span>
              </div>
            </div>

            {/* Supply APY Change */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Supply APY</p>
              <p className="text-lg font-bold text-white mb-1">
                {comparison.avgRecent.supplyAPY.toFixed(8)}%
              </p>
              <div className={`flex items-center text-sm ${
                comparison.changes.supplyAPY >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  comparison.changes.supplyAPY < 0 ? 'rotate-180' : ''
                }`} />
                <span>
                  {comparison.changes.supplyAPY >= 0 ? '+' : ''}{comparison.changes.supplyAPY.toFixed(8)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* TVL Chart */}
        <TVLChart data={tvlData} />

        {/* APY Chart with Event Markers */}
        <APYChart data={apyData} events={eventsLoading ? undefined : events} />

        {/* Index Chart with Event Markers */}
        <IndexChart data={indexData} events={eventsLoading ? undefined : events} />

        {/* Activity Chart */}
        <ActivityChart data={activityData} />

        {/* Volume Chart */}
        <VolumeChart data={volumeData} />
      </div>

      {/* Summary Stats */}
      {snapshots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-white">
              {snapshots.reduce((sum: number, s: any) => sum + s.suppliesCount + s.withdrawalsCount + s.borrowsCount + s.repaysCount, 0)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Node Operations</p>
            <p className="text-2xl font-bold text-white">
              {snapshots.reduce((sum: number, s: any) => sum + s.nodeDepositsCount + s.nodeWithdrawalsCount, 0)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Peak Users (Daily)</p>
            <p className="text-2xl font-bold text-white">
              {Math.max(...snapshots.map((s: any) => s.activeUsers))}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Avg Utilization</p>
            <p className="text-2xl font-bold text-white">
              {(() => {
                const avgUtilization = snapshots.reduce((sum: number, s: any) => {
                  // Convert BigInt string to number, handling basis points (10000 = 100%)
                  const rate = typeof s.utilizationRate === 'string' 
                    ? parseInt(s.utilizationRate) 
                    : Number(s.utilizationRate)
                  return sum + rate
                }, 0) / snapshots.length / 100 // Divide by 100 to convert basis points to percentage
                return avgUtilization.toFixed(8)
              })()}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

