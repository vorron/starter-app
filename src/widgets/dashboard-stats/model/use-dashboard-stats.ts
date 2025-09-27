import { useState, useEffect } from 'react'
import { apiClient } from '@/shared/api/client'
import { AppError, toAppError } from '@/shared/lib/errors'

interface DashboardStats {
  totalProjects: number
  completedTasks: number
  pendingTasks: number
  productivity: number
  recentActivity: {
    action: string
    project: string
    time: string
  }[]
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const stats = await apiClient.get<DashboardStats>('/dashboard/stats')
        if (mounted) {
          setData(stats)
        }
      } catch (err) {
        if (mounted) {
          setError(toAppError(err))
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  return { data, isLoading, error }
}