'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Property {
  estimatedValue: number
  lastValuationDate: string
}

export function PortfolioValueChart({ properties }: { properties: Property[] }) {
  // Generate 12 months of data
  const data = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (11 - i))
    
    const totalValue = properties.reduce((sum, p) => sum + p.estimatedValue, 0)
    // Simulate slight variations for demo
    const variance = (Math.random() - 0.5) * 0.02
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      value: totalValue * (1 + variance),
    }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
