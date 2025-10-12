'use client'

import { useState } from 'react'
import { useUserTimeline } from '@/hooks/useSubgraph'
import { EventCard } from './EventCard'
import { Clock, Filter } from 'lucide-react'

interface UserTimelineProps {
  address: string | null
}

type EventFilter = 'all' | 'supply' | 'borrow' | 'nodes'

export function UserTimeline({ address }: UserTimelineProps) {
  const [filter, setFilter] = useState<EventFilter>('all')
  const { supplyEvents, withdrawEvents, borrowEvents, repayEvents, nodeDeposits, nodeWithdrawals, isLoading, error } = useUserTimeline(address)

  if (!address) {
    return null
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Failed to load timeline: {error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // Combine all events and sort by timestamp
  const allEvents = [
    ...supplyEvents.map((e: any) => ({ ...e, type: 'supply' as const })),
    ...withdrawEvents.map((e: any) => ({ ...e, type: 'withdraw' as const })),
    ...borrowEvents.map((e: any) => ({ ...e, type: 'borrow' as const })),
    ...repayEvents.map((e: any) => ({ ...e, type: 'repay' as const })),
    ...nodeDeposits.map((e: any) => ({ ...e, type: 'nodeDeposit' as const })),
    ...nodeWithdrawals.map((e: any) => ({ ...e, type: 'nodeWithdrawal' as const })),
  ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

  // Filter events based on selected filter
  const filteredEvents = allEvents.filter(event => {
    if (filter === 'all') return true
    if (filter === 'supply') return event.type === 'supply' || event.type === 'withdraw'
    if (filter === 'borrow') return event.type === 'borrow' || event.type === 'repay'
    if (filter === 'nodes') return event.type === 'nodeDeposit' || event.type === 'nodeWithdrawal'
    return true
  })

  const filterOptions = [
    { value: 'all' as EventFilter, label: 'All Events', count: allEvents.length },
    { value: 'supply' as EventFilter, label: 'Supply/Withdraw', count: supplyEvents.length + withdrawEvents.length },
    { value: 'borrow' as EventFilter, label: 'Borrow/Repay', count: borrowEvents.length + repayEvents.length },
    { value: 'nodes' as EventFilter, label: 'Node Operations', count: nodeDeposits.length + nodeWithdrawals.length },
  ]

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center justify-end space-x-2">
        <Filter className="w-4 h-4 text-gray-400" />
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No transactions yet</h3>
          <p className="text-gray-500">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event: any) => (
            <EventCard
              key={event.id}
              type={event.type}
              amount={event.amount}
              nodeId={event.nodeId}
              assetValue={event.assetValue}
              timestamp={event.timestamp}
              transactionHash={event.transactionHash}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {allEvents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{supplyEvents.length}</p>
            <p className="text-xs text-gray-500">Supplies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{withdrawEvents.length}</p>
            <p className="text-xs text-gray-500">Withdrawals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{borrowEvents.length}</p>
            <p className="text-xs text-gray-500">Borrows</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{repayEvents.length}</p>
            <p className="text-xs text-gray-500">Repays</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{nodeDeposits.length}</p>
            <p className="text-xs text-gray-500">Node Deposits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-400">{nodeWithdrawals.length}</p>
            <p className="text-xs text-gray-500">Node Withdrawals</p>
          </div>
        </div>
      )}
    </div>
  )
}

