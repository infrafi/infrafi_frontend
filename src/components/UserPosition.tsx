'use client'

import { UserPosition as UserPositionType } from '@/types/contracts'
import { formatBalance, calculateHealthFactor } from '@/lib/utils'
import { DollarSign, Wallet, CreditCard } from 'lucide-react'

interface UserPositionProps {
  userPosition: UserPositionType | null
  isLoading: boolean
}

export function UserPosition({ userPosition, isLoading }: UserPositionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const healthFactor = userPosition 
    ? calculateHealthFactor(userPosition.collateralValue, userPosition.borrowed, 80)
    : Infinity

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* WOORT Balance */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-600 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">WOORT Balance</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? formatBalance(userPosition.woortBalance) : '0'}
            </p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
        </div>
      </div>

      {/* Supplied */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-600 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Supplied</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? formatBalance(userPosition.supplied) : '0'}
            </p>
            <p className="text-xs text-gray-500">WOORT</p>
          </div>
        </div>
      </div>

      {/* Borrowed */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-600 rounded-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Borrowed</p>
            <p className="text-2xl font-bold text-white">
              {userPosition ? formatBalance(userPosition.borrowed) : '0'}
            </p>
            <p className="text-xs text-gray-500">
              Health: {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
