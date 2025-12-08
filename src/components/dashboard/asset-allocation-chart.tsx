'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Property {
  propertyType: string
  estimatedValue: number
}

const COLORS = {
  house: 'hsl(var(--primary))',
  apartment: 'hsl(var(--secondary))',
  commercial: 'hsl(var(--accent))',
  land: 'hsl(var(--muted))',
}

export function AssetAllocationChart({ properties }: { properties: Property[] }) {
  const typeGroups = properties.reduce((acc, prop) => {
    const type = prop.propertyType
    if (!acc[type]) {
      acc[type] = { name: type.charAt(0).toUpperCase() + type.slice(1), value: 0 }
    }
    acc[type].value += prop.estimatedValue
    return acc
  }, {} as Record<string, { name: string; value: number }>)

  const data = Object.values(typeGroups)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.house} 
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
