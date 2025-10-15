'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useUserTimeline, useUserPosition } from '@/hooks/useSubgraph'
import { formatBalance } from '@/lib/utils'

interface UserPerformanceChartProps {
  address: string | null
}

export function UserPerformanceChart({ address }: UserPerformanceChartProps) {
  const { supplyEvents, withdrawEvents, borrowEvents, repayEvents, nodeDeposits, nodeWithdrawals, isLoading: eventsLoading } = useUserTimeline(address)
  const { userPosition, isLoading: positionLoading } = useUserPosition(address)

  const isLoading = eventsLoading || positionLoading

  // Memoize chart data calculation to prevent unnecessary re-renders
  // IMPORTANT: This must be called BEFORE any conditional returns to follow Rules of Hooks
  const chartData = useMemo(() => {
    // Return empty array if still loading or no address
    if (!address || isLoading) {
      return []
    }

    // Combine all events with their effects on balances
    const allEvents = [
    ...supplyEvents.map((e: any) => ({
      timestamp: Number(e.timestamp),
      type: 'supply',
      amount: BigInt(e.amount || 0),
    })),
    ...withdrawEvents.map((e: any) => ({
      timestamp: Number(e.timestamp),
      type: 'withdraw',
      amount: BigInt(e.amount || 0),
    })),
    ...borrowEvents.map((e: any) => ({
      timestamp: Number(e.timestamp),
      type: 'borrow',
      amount: BigInt(e.amount || 0),
    })),
    ...repayEvents.map((e: any) => ({
      timestamp: Number(e.timestamp),
      type: 'repay',
      amount: BigInt(e.amount || 0),
    })),
    ...nodeDeposits.map((e: any) => ({
      timestamp: Number(e.timestamp),
      type: 'nodeDeposit',
      amount: BigInt(e.assetValue || 0),
    })),
    ...nodeWithdrawals.map((e: any) => ({
      timestamp: Number(e.timestamp),
      type: 'nodeWithdrawal',
      amount: 0n,
    })),
    ].sort((a, b) => a.timestamp - b.timestamp)

    if (allEvents.length === 0) {
      return []
    }

    // Get current interest amounts
    const currentSupplyInterest = userPosition ? BigInt(userPosition.totalSupplyInterest || 0) : 0n
    const currentBorrowInterest = userPosition ? BigInt(userPosition.totalBorrowInterest || 0) : 0n
    
    // Calculate time span for interest estimation
    const firstTimestamp = allEvents.length > 0 ? allEvents[0].timestamp : 0
    const lastTimestamp = allEvents.length > 0 ? allEvents[allEvents.length - 1].timestamp : 0
    const timeSpan = lastTimestamp - firstTimestamp || 1 // Avoid division by zero

    // Calculate running balances
    let cumulativeSupplied = 0n
    let cumulativeBorrowed = 0n
    let cumulativeCollateral = 0n

    const data = allEvents.map((event, index) => {
      // Update running totals based on event type
      if (event.type === 'supply') {
        cumulativeSupplied += event.amount
      } else if (event.type === 'withdraw') {
        cumulativeSupplied -= event.amount
      } else if (event.type === 'borrow') {
        cumulativeBorrowed += event.amount
      } else if (event.type === 'repay') {
        cumulativeBorrowed -= event.amount
      } else if (event.type === 'nodeDeposit') {
        cumulativeCollateral += event.amount
      } else if (event.type === 'nodeWithdrawal') {
        // Note: We don't have the asset value on withdrawal, so we estimate
        // In production, you might want to track this more accurately
        cumulativeCollateral = 0n // Reset for now
      }

      // Estimate interest growth linearly over time
      const timeElapsed = event.timestamp - firstTimestamp
      const progressRatio = timeSpan > 0 ? timeElapsed / timeSpan : 0
      
      const estimatedSupplyInterest = currentSupplyInterest > 0n 
        ? Number(formatBalance(BigInt(Math.floor(Number(currentSupplyInterest) * progressRatio))))
        : 0
      
      const estimatedBorrowInterest = currentBorrowInterest > 0n
        ? Number(formatBalance(BigInt(Math.floor(Number(currentBorrowInterest) * progressRatio))))
        : 0

      const date = new Date(event.timestamp * 1000)
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const suppliedValue = Number(formatBalance(cumulativeSupplied))
      const borrowedValue = Number(formatBalance(cumulativeBorrowed))
      const collateralValue = Number(formatBalance(cumulativeCollateral))

      return {
        date: dateStr,
        timestamp: event.timestamp,
        supplied: suppliedValue,
        borrowed: borrowedValue,
        collateral: collateralValue,
        supplyInterest: estimatedSupplyInterest,
        borrowInterest: estimatedBorrowInterest,
        totalSupplyValue: suppliedValue + estimatedSupplyInterest,
        totalDebtValue: borrowedValue + estimatedBorrowInterest,
        netPosition: suppliedValue + collateralValue + estimatedSupplyInterest - borrowedValue - estimatedBorrowInterest,
      }
    })

    // Add current point if we have data
    if (data.length > 0 && userPosition) {
      const lastPoint = data[data.length - 1]
      const now = Math.floor(Date.now() / 1000)
      
      // Only add "Now" if more than 1 hour has passed
      if (now - lastPoint.timestamp > 3600) {
        const currentSupplyInterestNum = Number(formatBalance(currentSupplyInterest))
        const currentBorrowInterestNum = Number(formatBalance(currentBorrowInterest))
        
        data.push({
          date: 'Now',
          timestamp: now,
          supplied: lastPoint.supplied,
          borrowed: lastPoint.borrowed,
          collateral: lastPoint.collateral,
          supplyInterest: currentSupplyInterestNum,
          borrowInterest: currentBorrowInterestNum,
          totalSupplyValue: lastPoint.supplied + currentSupplyInterestNum,
          totalDebtValue: lastPoint.borrowed + currentBorrowInterestNum,
          netPosition: lastPoint.supplied + lastPoint.collateral + currentSupplyInterestNum - lastPoint.borrowed - currentBorrowInterestNum,
        })
      }
    }

    return data
  }, [
    address,
    supplyEvents,
    withdrawEvents,
    borrowEvents,
    repayEvents,
    nodeDeposits,
    nodeWithdrawals,
    userPosition,
  ])

  // Handle loading and empty states AFTER all hooks have been called
  if (!address || isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-80 bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">No transaction history to display</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Balance History</h3>
      <p className="text-sm text-gray-400 mb-6">
        Track how your positions and interest have evolved over time
      </p>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis 
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(0)}`}
            label={{ 
              value: 'WOORT', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#9CA3AF', fontSize: '12px' }
            }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(8)} WOORT`, '']}
            labelStyle={{ color: '#F3F4F6', marginBottom: '8px' }}
          />
          
          <Legend 
            wrapperStyle={{ color: '#9CA3AF', paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Supplied Amount (Green) */}
          <Line 
            type="monotone" 
            dataKey="supplied"
            stroke="#10B981"
            strokeWidth={2}
            name="Supplied"
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* Collateral Value (Cyan) */}
          <Line 
            type="monotone" 
            dataKey="collateral"
            stroke="#06B6D4"
            strokeWidth={2}
            name="Collateral"
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* Borrowed Amount (Orange) */}
          <Line 
            type="monotone" 
            dataKey="borrowed"
            stroke="#F97316"
            strokeWidth={2}
            name="Borrowed (Principal)"
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* Supply Interest (Light Green) */}
          <Line 
            type="monotone" 
            dataKey="supplyInterest"
            stroke="#86EFAC"
            strokeWidth={1.5}
            name="Interest Earned"
            dot={false}
            activeDot={{ r: 5 }}
            strokeDasharray="3 3"
          />
          
          {/* Borrow Interest (Light Red) */}
          <Line 
            type="monotone" 
            dataKey="borrowInterest"
            stroke="#FCA5A5"
            strokeWidth={1.5}
            name="Interest Owed"
            dot={false}
            activeDot={{ r: 5 }}
            strokeDasharray="3 3"
          />
          
          {/* Net Position (Purple) */}
          <Line 
            type="monotone" 
            dataKey="netPosition"
            stroke="#A855F7"
            strokeWidth={2}
            name="Net Position"
            dot={false}
            activeDot={{ r: 6 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend Explanation */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-gray-900/50 rounded p-2">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Supplied</span>
          </div>
          <p className="text-gray-500 text-xs">Principal lent to vault</p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="flex items-center mb-1">
            <div className="w-3 h-0.5 bg-green-300 mr-2" style={{ borderTop: '2px dashed', width: '12px' }}></div>
            <span className="text-gray-400">Interest Earned</span>
          </div>
          <p className="text-gray-500 text-xs">APY from lending</p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Collateral</span>
          </div>
          <p className="text-gray-500 text-xs">Node asset value</p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Borrowed</span>
          </div>
          <p className="text-gray-500 text-xs">Principal debt</p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="flex items-center mb-1">
            <div className="w-3 h-0.5 bg-red-300 mr-2" style={{ borderTop: '2px dashed', width: '12px' }}></div>
            <span className="text-gray-400">Interest Owed</span>
          </div>
          <p className="text-gray-500 text-xs">APR on debt</p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <div className="flex items-center mb-1">
            <div className="w-3 h-0.5 bg-purple-500 mr-2" style={{ borderTop: '2px dashed', width: '12px' }}></div>
            <span className="text-gray-400">Net Position</span>
          </div>
          <p className="text-gray-500 text-xs">Total worth</p>
        </div>
      </div>
    </div>
  )
}

