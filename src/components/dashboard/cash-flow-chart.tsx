'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { format, subMonths, startOfMonth } from 'date-fns'

interface Transaction {
  type: string
  amount: number
  date: string
}

export function CashFlowChart({ transactions }: { transactions: Transaction[] }) {
  // Group by month for last 6 months
  const data = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(new Date(), 5 - i))
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date >= monthStart && date <= monthEnd
    })

    const income = monthTransactions
      .filter(t => t.type === 'rental_income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = Math.abs(
      monthTransactions
        .filter(t => t.type !== 'rental_income')
        .reduce((sum, t) => sum + t.amount, 0)
    )

    return {
      month: format(monthStart, 'MMM'),
      income,
      expenses,
    }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" />
        <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
