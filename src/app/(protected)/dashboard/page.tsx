import { DashboardStats } from '@/widgets/dashboard-stats/ui/dashboard-stats';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back!</p>
      </div>
      <DashboardStats />
    </div>
  );
}
