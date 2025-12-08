'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PortfolioValueChart } from './portfolio-value-chart'
import { AssetAllocationChart } from './asset-allocation-chart'
import { CashFlowChart } from './cash-flow-chart'
import { MortgageBalanceChart } from './mortgage-balance-chart'
import { formatCurrency } from '@/lib/utils'
import { Building2, DollarSign, TrendingUp, Wallet } from 'lucide-react'

export function DashboardOverview() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('Failed to fetch properties')
      return res.json()
    },
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions')
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json()
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const totalValue = properties.reduce((sum: number, p: any) => sum + p.estimatedValue, 0)
  const totalEquity = properties.reduce(
    (sum: number, p: any) => sum + (p.estimatedValue - p.outstandingBalance),
    0
  )
  const monthlyIncome = properties.reduce((sum: number, p: any) => sum + (p.monthlyRent || 0), 0)
  const monthlyMortgage = properties.reduce((sum: number, p: any) => sum + p.monthlyPayment, 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalEquity / totalValue) * 100).toFixed(1)}% equity ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">Rental income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyIncome - monthlyMortgage)}
            </div>
            <p className="text-xs text-muted-foreground">
              After mortgage payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value Trend</CardTitle>
            <CardDescription>Last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PortfolioValueChart properties={properties} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>By property type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AssetAllocationChart properties={properties} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Analysis</CardTitle>
            <CardDescription>Income vs Expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <CashFlowChart transactions={transactions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mortgage Balance</CardTitle>
            <CardDescription>Outstanding debt by property</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <MortgageBalanceChart properties={properties} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
