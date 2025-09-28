"use client";
import { useUser } from "@/entities/session/model/session.store";
import { useDashboardStats } from "../model/use-dashboard-stats";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const user = useUser();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-12 bg-muted animate-pulse rounded mb-1"></div>
              <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Failed to load dashboard data</p>
            <p className="text-sm">{error.userMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects.toString()}
          subtitle="+2 from last month"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks.toString()}
          subtitle="+5 from yesterday"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks.toString()}
          subtitle="2 due today"
        />
        <StatCard
          title="Productivity"
          value={`${stats.productivity}%`}
          subtitle="+15% from last month"
        />
      </div>
    </div>
  );
}
