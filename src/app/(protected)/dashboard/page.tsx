// src/app/(protected)/dashboard/page.tsx
import { RequireAuth } from '@/features/auth/lib/require-auth'
import { DashboardStats } from '@/widgets/dashboard-stats/ui/dashboard-stats'

// Серверный компонент для данных
async function DashboardData() {
  // Здесь можно делать серверные запросы
  return <DashboardStats />
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back!
          </p>
        </div>
        <DashboardData />
      </div>
    </RequireAuth>
  )
}