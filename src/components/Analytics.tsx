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
  
  const activityData = formatActivityChartData(snapshots, eventsLoading ? undefined : events)
  const volumeData = formatVolumeChartData(snapshots, eventsLoading ? undefined : events)

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
                }, 0) / snapshots.length
                return (avgUtilization / 100).toFixed(2)
              })()}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

