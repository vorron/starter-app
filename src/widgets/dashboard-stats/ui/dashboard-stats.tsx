'use client'

import { useUser } from '@/entities/user/model/user.store'
import { useDashboardStats } from '../model/use-dashboard-stats'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';

// Вспомогательный компонент для карточки статистики
function StatCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// Основной компонент дашборда
export function DashboardStats() {
  const user = useUser()
  const { data: stats, isLoading, error } = useDashboardStats()

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
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Не удалось загрузить статистику</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Добро пожаловать, {user?.name}!</h2>
        <p className="text-muted-foreground">Обзор вашей активности и статистики</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего проектов"
          value={stats.totalProjects.toString()}
          subtitle="+2 с прошлой недели"
          icon={<FolderIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Завершённые задачи"
          value={stats.completedTasks.toString()}
          subtitle="+5 за сегодня"
          icon={<CheckCircleIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Ожидающие"
          value={stats.pendingTasks.toString()}
          subtitle="2 с высоким приоритетом"
          icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Продуктивность"
          value={`${stats.productivity}%`}
          subtitle="Выше среднего на 15%"
          icon={<TrendingUpIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Дополнительные секции дашборда */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.project}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors">
                Создать новый проект
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors">
                Пригласить участника
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors">
                Настройки рабочего пространства
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Иконки (можно заменить на реальные из библиотеки like lucide-react)
function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}