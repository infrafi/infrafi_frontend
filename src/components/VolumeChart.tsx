'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface VolumeChartProps {
  data: Array<{
    date: string
    supplyVolume: number
    withdrawVolume: number
    borrowVolume: number
    repayVolume: number
  }>
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Daily Volume</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(0)}`}
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
          <Bar dataKey="supplyVolume" fill="#10B981" name="Supply Volume" />
          <Bar dataKey="withdrawVolume" fill="#3B82F6" name="Withdraw Volume" />
          <Bar dataKey="borrowVolume" fill="#F59E0B" name="Borrow Volume" />
          <Bar dataKey="repayVolume" fill="#8B5CF6" name="Repay Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

