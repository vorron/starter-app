'use client'

import { RequireAuth } from '@/features/auth/lib/require-auth'
import { useUser } from '@/entities/session/model/session.store'
import { DashboardStats } from '@/widgets/dashboard-stats/ui/dashboard-stats'

export default function DashboardPage() {
  const user = useUser()

  return (
    <RequireAuth>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}!
          </p>
        </div>
        <DashboardStats />
      </div>
    </RequireAuth>
  )
}