'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Property {
  street: string
  city: string
  outstandingBalance: number
}

export function MortgageBalanceChart({ properties }: { properties: Property[] }) {
  const data = properties.map(p => ({
    name: `${p.street.split(' ')[0]} ${p.city}`,
    balance: p.outstandingBalance,
  })).slice(0, 5)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Bar dataKey="balance" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  )
}
