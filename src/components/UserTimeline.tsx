'use client'

import { useState } from 'react'
import { useUserTimeline } from '@/hooks/useSubgraph'
import { EventCard } from './EventCard'
import { Clock, Filter, Search, X, Download, Calendar } from 'lucide-react'
import { formatBalance } from '@/lib/utils'

interface UserTimelineProps {
  address: string | null
}

type EventFilter = 'all' | 'supply' | 'borrow' | 'nodes'
type DateRange = '7d' | '30d' | '90d' | 'all'

export function UserTimeline({ address }: UserTimelineProps) {
  const [filter, setFilter] = useState<EventFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('all')
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

  // Calculate date range cutoff
  const getDateCutoff = () => {
    if (dateRange === 'all') return 0
    const now = Date.now() / 1000
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    return now - (days * 86400)
  }

  // Filter events based on selected filter, search term, and date range
  const filteredEvents = allEvents.filter(event => {
    // Apply date range filter
    if (dateRange !== 'all') {
      const cutoff = getDateCutoff()
      if (Number(event.timestamp) < cutoff) return false
    }
    
    // Apply category filter
    let matchesFilter = true
    if (filter === 'supply') matchesFilter = event.type === 'supply' || event.type === 'withdraw'
    else if (filter === 'borrow') matchesFilter = event.type === 'borrow' || event.type === 'repay'
    else if (filter === 'nodes') matchesFilter = event.type === 'nodeDeposit' || event.type === 'nodeWithdrawal'
    
    if (!matchesFilter) return false
    
    // Apply search term
    if (!searchTerm.trim()) return true
    
    const term = searchTerm.toLowerCase()
    
    // Search in transaction hash
    if (event.transactionHash && event.transactionHash.toLowerCase().includes(term)) {
      return true
    }
    
    // Search in amount (if exists)
    if (event.amount) {
      const formattedAmount = formatBalance(BigInt(event.amount))
      if (formattedAmount.includes(term)) {
        return true
      }
    }
    
    // Search in node ID (if exists)
    if (event.nodeId && event.nodeId.toString().includes(term)) {
      return true
    }
    
    // Search in asset value (if exists)
    if (event.assetValue) {
      const formattedValue = formatBalance(BigInt(event.assetValue))
      if (formattedValue.includes(term)) {
        return true
      }
    }
    
    // Search in event type
    if (event.type.toLowerCase().includes(term)) {
      return true
    }
    
    return false
  })

  const filterOptions = [
    { value: 'all' as EventFilter, label: 'All Events', count: allEvents.length },
    { value: 'supply' as EventFilter, label: 'Supply/Withdraw', count: supplyEvents.length + withdrawEvents.length },
    { value: 'borrow' as EventFilter, label: 'Borrow/Repay', count: borrowEvents.length + repayEvents.length },
    { value: 'nodes' as EventFilter, label: 'Node Operations', count: nodeDeposits.length + nodeWithdrawals.length },
  ]

  // Export to CSV function
  const exportToCSV = () => {
    if (filteredEvents.length === 0) return

    // CSV headers
    const headers = ['Date', 'Time', 'Type', 'Amount (WOORT)', 'Node ID', 'Asset Value (WOORT)', 'Transaction Hash']
    
    // Convert events to CSV rows
    const rows = filteredEvents.map((event: any) => {
      const date = new Date(Number(event.timestamp) * 1000)
      const dateStr = date.toLocaleDateString('en-US')
      const timeStr = date.toLocaleTimeString('en-US')
      const type = event.type.charAt(0).toUpperCase() + event.type.slice(1)
      const amount = event.amount ? formatBalance(BigInt(event.amount)) : '-'
      const nodeId = event.nodeId || '-'
      const assetValue = event.assetValue ? formatBalance(BigInt(event.assetValue)) : '-'
      const txHash = event.transactionHash
      
      return [dateStr, timeStr, type, amount, nodeId, assetValue, txHash]
    })
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const filename = `infrafi-transactions-${address?.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const dateRangeOptions = [
    { value: '7d' as DateRange, label: 'Last 7 days' },
    { value: '30d' as DateRange, label: 'Last 30 days' },
    { value: '90d' as DateRange, label: 'Last 90 days' },
    { value: 'all' as DateRange, label: 'All time' },
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Date Range Picker */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Time Period:</span>
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dateRange === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by transaction hash, amount, node ID, or type..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Category Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
          
          {/* Export Button and Search Results Counter */}
          <div className="flex items-center space-x-3">
            {searchTerm && (
              <div className="text-sm text-gray-400">
                {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} found
              </div>
            )}
            {filteredEvents.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          {searchTerm || filter !== 'all' ? (
            <>
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No matching transactions</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No results found for "${searchTerm}"`
                  : 'No transactions in this category'
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilter('all')
                  setDateRange('all')
                }}
                className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                Clear all filters
              </button>
            </>
          ) : (
            <>
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Your transaction history will appear here</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event: any) => (
            <EventCard
              key={event.id}
              type={event.type}
              amount={event.amount}
              principalAmount={event.principalAmount}
              interestAmount={event.interestAmount}
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

