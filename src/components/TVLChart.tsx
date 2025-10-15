'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TVLChartProps {
  data: Array<{
    date: string
    totalSupplied: number
    totalBorrowed: number
    totalCollateral: number
  }>
}

export function TVLChart({ data }: TVLChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Total Value Locked (TVL)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(0)} WOORT`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(8)} WOORT`, '']}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="totalSupplied" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Total Supplied"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="totalBorrowed" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Total Borrowed"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="totalCollateral" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            name="Total Collateral"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

