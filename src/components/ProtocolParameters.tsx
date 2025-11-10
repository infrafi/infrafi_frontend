'use client'

import { ProtocolStats } from '@/types/contracts'
import { PROTOCOL_PARAMS } from '@/config/contracts'
import { Shield, TrendingUp, PieChart, Info } from 'lucide-react'

interface ProtocolParametersProps {
  protocolStats: ProtocolStats | null
  isLoading: boolean
}

export function ProtocolParameters({ protocolStats, isLoading }: ProtocolParametersProps) {
  // Read all parameters from contract (in basis points), fallback to config
  const maxLTVPercent = protocolStats?.maxLTV 
    ? protocolStats.maxLTV / 100 
    : PROTOCOL_PARAMS.maxLTVPercent
  
  const liquidationThreshold = protocolStats?.liquidationThreshold 
    ? protocolStats.liquidationThreshold / 100 
    : PROTOCOL_PARAMS.liquidationThreshold
  
  const baseRate = protocolStats?.baseRatePerYear 
    ? protocolStats.baseRatePerYear 
    : PROTOCOL_PARAMS.interestRateModel.baseRate
  
  const multiplier = protocolStats?.multiplierPerYear 
    ? protocolStats.multiplierPerYear 
    : PROTOCOL_PARAMS.interestRateModel.multiplier
  
  const kinkPoint = protocolStats?.kink 
    ? protocolStats.kink 
    : PROTOCOL_PARAMS.interestRateModel.kink
  
  const jumpRate = protocolStats?.jumpMultiplierPerYear 
    ? protocolStats.jumpMultiplierPerYear 
    : PROTOCOL_PARAMS.interestRateModel.jump
  
  const lenderShare = protocolStats 
    ? 100 - protocolStats.deployerSharePercentage - protocolStats.protocolSharePercentage
    : PROTOCOL_PARAMS.revenueSharing.lenderShare
  
  const deployerShare = protocolStats?.deployerSharePercentage 
    ?? PROTOCOL_PARAMS.revenueSharing.deployerShare
  
  const protocolShare = protocolStats?.protocolSharePercentage 
    ?? PROTOCOL_PARAMS.revenueSharing.protocolShare

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-700 rounded-lg"></div>
        <div className="h-48 bg-gray-700 rounded-lg"></div>
        <div className="h-32 bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Loan Parameters */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Loan Parameters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Maximum LTV</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    Maximum loan-to-value ratio for borrowing
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-400">{maxLTVPercent.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="card">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Liquidation Threshold</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    LTV threshold where positions can be liquidated
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold text-red-400">{liquidationThreshold.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Rate Model */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Interest Rate Model</h3>
        </div>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-400">Base Rate</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    Minimum interest rate when utilization is 0%
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{(baseRate / 100).toFixed(2)}%</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-400">Multiplier</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    Rate increase per utilization % before kink
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{(multiplier / 100).toFixed(2)}%</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-400">Kink Point</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    Utilization % where jump rate kicks in
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{(kinkPoint / 100).toFixed(0)}%</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-400">Jump Rate</span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                    Steep rate increase after kink point
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{(jumpRate / 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Interest Rate Formula Explanation */}
          <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Interest Rate Formula:</p>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• <span className="font-mono">If Utilization ≤ {(kinkPoint / 100).toFixed(0)}%:</span></p>
              <p className="ml-4 font-mono text-gray-400">
                Rate = {(baseRate / 100).toFixed(2)}% + ({(multiplier / 100).toFixed(2)}% × Utilization)
              </p>
              <p className="mt-2">• <span className="font-mono">If Utilization {'>'} {(kinkPoint / 100).toFixed(0)}%:</span></p>
              <p className="ml-4 font-mono text-gray-400">
                Rate = Base + Multiplier + ({(jumpRate / 100).toFixed(0)}% × (Utilization - {(kinkPoint / 100).toFixed(0)}%))
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Sharing Model */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Revenue Distribution</h3>
        </div>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <p className="text-sm text-gray-400 mb-2">Lenders Share</p>
              <p className="text-3xl font-bold text-purple-400">{lenderShare}%</p>
              <p className="text-xs text-gray-500 mt-2">Interest earned by suppliers</p>
            </div>
            
            <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <p className="text-sm text-gray-400 mb-2">Deployer Share</p>
              <p className="text-3xl font-bold text-blue-400">{deployerShare}%</p>
              <p className="text-xs text-gray-500 mt-2">Adapter deployer rewards</p>
            </div>
            
            <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/30">
              <p className="text-sm text-gray-400 mb-2">Protocol Share</p>
              <p className="text-3xl font-bold text-green-400">{protocolShare}%</p>
              <p className="text-xs text-gray-500 mt-2">Protocol reserves</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
            <p className="text-xs text-gray-400">
              <span className="font-semibold">Note:</span> All interest paid by borrowers is automatically distributed according to this revenue sharing model. 
              Lenders receive {lenderShare}% of interest income directly in their supply positions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

