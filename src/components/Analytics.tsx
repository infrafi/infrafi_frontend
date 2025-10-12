'use client'

import { useState } from 'react'
import { useDailySnapshots } from '@/hooks/useSubgraph'
import { 
  formatTVLChartData, 
  formatAPYChartData, 
  formatActivityChartData, 
  formatVolumeChartData 
} from '@/lib/chart-utils'
import { TVLChart } from './TVLChart'
import { APYChart } from './APYChart'
import { ActivityChart } from './ActivityChart'
import { VolumeChart } from './VolumeChart'
import { TrendingUp } from 'lucide-react'

export function Analytics() {
  const [days, setDays] = useState(30)
  const { snapshots, isLoading, error } = useDailySnapshots(days)

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Failed to load analytics data: {error}</p>
      </div>
    )
  }

  if (isLoading) {
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

  const tvlData = formatTVLChartData(snapshots)
  const apyData = formatAPYChartData(snapshots)
  const activityData = formatActivityChartData(snapshots)
  const volumeData = formatVolumeChartData(snapshots)

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

        {/* APY Chart */}
        <APYChart data={apyData} />

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
              {(snapshots.reduce((sum: number, s: any) => sum + s.utilizationRate, 0) / snapshots.length / 100).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

