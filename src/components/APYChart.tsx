'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts'
import { useState } from 'react'

interface EventMarker {
  date: string
  timestamp: number
  type: 'supply' | 'withdraw' | 'borrow' | 'repay' | 'nodeDeposit' | 'nodeWithdrawal'
  amount?: string
  user: string
  txHash: string
  yValue: number  // Y-axis position for the marker
}

interface APYChartProps {
  data: Array<{
    date: string
    timestamp?: number
    supplyAPY: number
    borrowAPY: number
    utilization: number
  }>
  events?: {
    supplyEvents: any[]
    withdrawEvents: any[]
    borrowEvents: any[]
    repayEvents: any[]
    nodeDepositEvents: any[]
    nodeWithdrawalEvents: any[]
  }
}

export function APYChart({ data, events }: APYChartProps) {
  const [showEventLabels, setShowEventLabels] = useState(true)
  const [timeFrame, setTimeFrame] = useState<'1h' | '6h' | '24h' | '7d' | '30d' | 'all'>('7d')

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  // Filter data based on selected time frame
  const now = Math.floor(Date.now() / 1000)
  const timeFrameSeconds: Record<string, number> = {
    '1h': 3600,
    '6h': 6 * 3600,
    '24h': 24 * 3600,
    '7d': 7 * 24 * 3600,
    '30d': 30 * 24 * 3600,
    'all': Infinity,
  }
  
  const cutoffTime = timeFrame === 'all' ? 0 : now - timeFrameSeconds[timeFrame]
  const filteredData = data.filter(d => !d.timestamp || d.timestamp >= cutoffTime)

  // Create event markers from all events
  const eventMarkers: EventMarker[] = []
  
  if (events && filteredData.length > 0) {
    // Debug logging
    const firstTimestamp = filteredData[0]?.timestamp
    const lastTimestamp = filteredData[filteredData.length - 1]?.timestamp
    
    console.log('📊 APY Chart - Event Data:', {
      supplyEvents: events.supplyEvents?.length || 0,
      withdrawEvents: events.withdrawEvents?.length || 0,
      borrowEvents: events.borrowEvents?.length || 0,
      repayEvents: events.repayEvents?.length || 0,
      nodeDepositEvents: events.nodeDepositEvents?.length || 0,
      nodeWithdrawalEvents: events.nodeWithdrawalEvents?.length || 0,
      chartDataPoints: filteredData.length,
      timeFrame: timeFrame,
      timeRange: firstTimestamp && lastTimestamp
        ? `${new Date(firstTimestamp * 1000).toISOString()} to ${new Date(lastTimestamp * 1000).toISOString()}`
        : 'Unknown'
    })

    // Get max utilization for positioning markers at the top
    const maxY = Math.max(...filteredData.map(d => Math.max(d.supplyAPY, d.borrowAPY, d.utilization))) * 0.95

    // Helper to create markers with smart matching
    const createMarkers = (eventList: any[], type: EventMarker['type']) => {
      let matched = 0
      let unmatched = 0
      
      eventList.forEach(event => {
        const timestamp = Number(event.timestamp)
        
        // Try to find the closest data point within a reasonable time window
        // Sort by distance and pick the closest one within 12 hours
        const MAX_TIME_DIFF = 12 * 3600 // 12 hours in seconds
        
        let closestPoint: any = null
        let minDiff = Infinity
        
        for (const d of filteredData) {
          if (d.timestamp) {
            const diff = Math.abs(d.timestamp - timestamp)
            if (diff < minDiff && diff < MAX_TIME_DIFF) {
              minDiff = diff
              closestPoint = d
            }
          }
        }
        
        if (closestPoint) {
          matched++
          eventMarkers.push({
            date: closestPoint.date,
            timestamp,
            type,
            amount: event.amount,
            user: event.user?.address || 'Unknown',
            txHash: event.transactionHash,
            yValue: maxY,
          })
        } else {
          unmatched++
          if (unmatched <= 3) { // Only log first 3 to avoid console spam
            console.log(`⚠️ Unmatched ${type} event at timestamp ${timestamp} (${new Date(timestamp * 1000).toISOString()})`)
          }
        }
      })
      
      if (matched > 0 || unmatched > 0) {
        console.log(`📍 ${type}: ${matched} matched, ${unmatched > 3 ? `${unmatched} (showing first 3)` : unmatched} unmatched`)
      }
    }

    createMarkers(events.supplyEvents, 'supply')
    createMarkers(events.withdrawEvents, 'withdraw')
    createMarkers(events.borrowEvents, 'borrow')
    createMarkers(events.repayEvents, 'repay')
    createMarkers(events.nodeDepositEvents, 'nodeDeposit')
    createMarkers(events.nodeWithdrawalEvents, 'nodeWithdrawal')
    
    console.log(`✅ Total event markers created: ${eventMarkers.length}`)
  }

  // Event type configurations
  const eventConfig = {
    supply: { color: '#10B981', symbol: '▲', label: 'Supply' },
    withdraw: { color: '#3B82F6', symbol: '▼', label: 'Withdraw' },
    borrow: { color: '#F59E0B', symbol: '●', label: 'Borrow' },
    repay: { color: '#8B5CF6', symbol: '◆', label: 'Repay' },
    nodeDeposit: { color: '#06B6D4', symbol: '■', label: 'Node Deposit' },
    nodeWithdrawal: { color: '#EC4899', symbol: '□', label: 'Node Withdraw' },
  }

  // Custom tooltip for event markers
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const dataPoint = payload[0].payload
    const relevantEvents = eventMarkers.filter(e => e.date === label)

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-white mb-2">{label}</p>
        
        {/* APY Data */}
        <div className="space-y-1 mb-2">
          <p className="text-xs text-green-400">Supply APY: {dataPoint.supplyAPY?.toFixed(2)}%</p>
          <p className="text-xs text-orange-400">Borrow APY: {dataPoint.borrowAPY?.toFixed(2)}%</p>
          <p className="text-xs text-purple-400">Utilization: {dataPoint.utilization?.toFixed(2)}%</p>
        </div>

        {/* Event Markers */}
        {relevantEvents.length > 0 && (
          <div className="border-t border-gray-700 pt-2 mt-2">
            <p className="text-xs font-semibold text-gray-400 mb-1">Events ({relevantEvents.length}):</p>
            {relevantEvents.slice(0, 5).map((event, idx) => (
              <p key={idx} className="text-xs" style={{ color: eventConfig[event.type].color }}>
                {eventConfig[event.type].symbol} {eventConfig[event.type].label}
                {event.amount && `: ${(Number(event.amount) / 1e18).toFixed(2)}`}
              </p>
            ))}
            {relevantEvents.length > 5 && (
              <p className="text-xs text-gray-500">...and {relevantEvents.length - 5} more</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Calculate event statistics
  const eventStats = events ? {
    total: (events.supplyEvents?.length || 0) + (events.withdrawEvents?.length || 0) + 
           (events.borrowEvents?.length || 0) + (events.repayEvents?.length || 0) +
           (events.nodeDepositEvents?.length || 0) + (events.nodeWithdrawalEvents?.length || 0),
    supply: events.supplyEvents?.length || 0,
    withdraw: events.withdrawEvents?.length || 0,
    borrow: events.borrowEvents?.length || 0,
    repay: events.repayEvents?.length || 0,
    nodeDeposit: events.nodeDepositEvents?.length || 0,
    nodeWithdrawal: events.nodeWithdrawalEvents?.length || 0,
  } : null

  // Time frame options
  const timeFrameOptions = [
    { value: '1h', label: '1H' },
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: 'all', label: 'ALL' },
  ] as const

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-white">Interest Rates History</h3>
          
          {/* Time Frame Selector */}
          <div className="flex items-center space-x-1 bg-gray-900/50 rounded-lg p-1">
            {timeFrameOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFrame(option.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeFrame === option.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Debug Info Badge */}
          {eventStats && (
            <div className="text-xs px-2 py-1 bg-blue-900/30 border border-blue-700/50 rounded text-blue-300">
              {eventStats.total} events found ({eventMarkers.length} shown)
            </div>
          )}
        </div>
        
        {/* Event Legend & Toggle */}
        {eventMarkers.length > 0 && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowEventLabels(!showEventLabels)}
              className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
            >
              {showEventLabels ? 'Hide Events' : 'Show Events'}
            </button>
            
            <div className="flex items-center space-x-3 text-xs">
              {Object.entries(eventConfig).map(([type, config]) => {
                const count = eventMarkers.filter(e => e.type === type).length
                if (count === 0) return null
                return (
                  <div key={type} className="flex items-center space-x-1">
                    <span style={{ color: config.color }} className="font-bold text-sm">
                      {config.symbol}
                    </span>
                    <span className="text-gray-400">
                      {config.label} ({count})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Statistics Debug Panel */}
      {eventStats && eventStats.total > 0 && (
        <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400">Event Statistics (from Subgraph)</p>
            <p className="text-xs text-gray-500">
              {eventMarkers.length < eventStats.total && (
                <span className="text-yellow-400">
                  ⚠️ {eventStats.total - eventMarkers.length} events outside chart range
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-6 gap-2 text-xs">
            {eventStats.supply > 0 && (
              <div className="text-center">
                <p className="text-green-400 font-bold">{eventStats.supply}</p>
                <p className="text-gray-500">Supply</p>
              </div>
            )}
            {eventStats.withdraw > 0 && (
              <div className="text-center">
                <p className="text-blue-400 font-bold">{eventStats.withdraw}</p>
                <p className="text-gray-500">Withdraw</p>
              </div>
            )}
            {eventStats.borrow > 0 && (
              <div className="text-center">
                <p className="text-orange-400 font-bold">{eventStats.borrow}</p>
                <p className="text-gray-500">Borrow</p>
              </div>
            )}
            {eventStats.repay > 0 && (
              <div className="text-center">
                <p className="text-purple-400 font-bold">{eventStats.repay}</p>
                <p className="text-gray-500">Repay</p>
              </div>
            )}
            {eventStats.nodeDeposit > 0 && (
              <div className="text-center">
                <p className="text-cyan-400 font-bold">{eventStats.nodeDeposit}</p>
                <p className="text-gray-500">Node Dep</p>
              </div>
            )}
            {eventStats.nodeWithdrawal > 0 && (
              <div className="text-center">
                <p className="text-pink-400 font-bold">{eventStats.nodeWithdrawal}</p>
                <p className="text-gray-500">Node Wdrw</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="supplyAPY" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Supply APY"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="borrowAPY" 
            stroke="#F97316" 
            strokeWidth={2}
            name="Borrow APY"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="utilization" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            name="Utilization Rate"
            dot={false}
          />

          {/* Event Markers */}
          {showEventLabels && eventMarkers.map((event, idx) => (
            <ReferenceDot
              key={`${event.type}-${event.timestamp}-${idx}`}
              x={event.date}
              y={event.yValue}
              r={6}
              fill={eventConfig[event.type].color}
              stroke="#1F2937"
              strokeWidth={2}
              opacity={0.8}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

