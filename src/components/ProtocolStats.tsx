'use client'

import { ProtocolStats as ProtocolStatsType } from '@/types/contracts'
import { formatBalance, formatAPY, formatUtilization } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react'

interface ProtocolStatsProps {
  protocolStats: ProtocolStatsType | null
  isLoading: boolean
}

export function ProtocolStats({ protocolStats, isLoading }: ProtocolStatsProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Supplied */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-600 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Supplied</p>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatBalance(protocolStats.totalSupplied) : '0'}
            </p>
            <p className="text-xs text-gray-500">WOORT</p>
          </div>
        </div>
      </div>

      {/* Total Borrowed */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Borrowed</p>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatBalance(protocolStats.totalBorrowed) : '0'}
            </p>
            <p className="text-xs text-gray-500">WOORT</p>
          </div>
        </div>
      </div>

      {/* Supply APY */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Supply APY</p>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatAPY(protocolStats.supplyAPY) : '-.-%'}
            </p>
            <p className="text-xs text-gray-500">Annual Rate</p>
          </div>
        </div>
      </div>

      {/* Utilization */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Utilization</p>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatUtilization(protocolStats.utilizationRate) : '-.-%'}
            </p>
            <p className="text-xs text-gray-500">Pool Usage</p>
          </div>
        </div>
      </div>
    </div>
  )
}
