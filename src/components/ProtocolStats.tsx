'use client'

import { ProtocolStats as ProtocolStatsType } from '@/types/contracts'
import { formatTokenAmount, formatAPY, formatUtilization } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, Users, Info } from 'lucide-react'

interface ProtocolStatsProps {
  protocolStats: ProtocolStatsType | null
  isLoading: boolean
}

export function ProtocolStats({ protocolStats, isLoading }: ProtocolStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-6">
      {/* Total Liquidity */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-600 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-400">Available Liquidity</p>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                  Available liquidity = total supplied minus borrowed tokens plus repaid interest
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatTokenAmount(protocolStats.totalSupplied, 18, 8) : '0.00000000'}
            </p>
          </div>
        </div>
      </div>

      {/* Total Debt */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-400">Total Debt</p>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                  Total debt = total borrowed tokens plus non-repaid interests
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatTokenAmount(protocolStats.totalDebt, 18, 8) : '0.00000000'}
            </p>
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
            <p className="text-xs text-gray-500">Lenders Earn</p>
          </div>
        </div>
      </div>

      {/* Borrow APY */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Borrow APY</p>
            <p className="text-2xl font-bold text-white">
              {protocolStats ? formatAPY(protocolStats.borrowAPY) : '-.-%'}
            </p>
            <p className="text-xs text-gray-500">Borrowers Pay</p>
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
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-400">Utilization</p>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                  Percentage of available liquidity that is currently borrowed
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
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
