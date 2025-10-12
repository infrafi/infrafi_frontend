'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface APYChartProps {
  data: Array<{
    date: string
    supplyAPY: number
    borrowAPY: number
    utilization: number
  }>
}

export function APYChart({ data }: APYChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Interest Rates History</h3>
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
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
          />
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

