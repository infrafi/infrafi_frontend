'use client'

import { Coins, Wallet, Building2 } from 'lucide-react'

export function RevenueSharing() {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">💰 Revenue Sharing Model</h3>
        <p className="text-sm text-gray-400">
          Interest revenue from borrowers is distributed across the protocol ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lenders */}
        <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/10 rounded-lg border border-green-600/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Lenders</p>
              <p className="text-2xl font-bold text-green-400">80%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Distributed proportionally to all token suppliers based on their share
          </p>
        </div>

        {/* Adapter Deployers */}
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-lg border border-blue-600/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Deployers</p>
              <p className="text-2xl font-bold text-blue-400">15%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Rewards for protocol adapter developers who enable new DePIN integrations
          </p>
        </div>

        {/* Protocol Reserves */}
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-lg border border-purple-600/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Protocol</p>
              <p className="text-2xl font-bold text-purple-400">5%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Accumulated for protocol development, security audits, and community growth
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          ℹ️ Revenue sharing activates when borrowers repay loans with interest
        </p>
      </div>
    </div>
  )
}

