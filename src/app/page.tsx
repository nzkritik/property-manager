import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardOverview } from '@/components/dashboard/overview'

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your property portfolio
          </p>
        </div>
        <DashboardOverview />
      </div>
    </DashboardLayout>
  )
}
