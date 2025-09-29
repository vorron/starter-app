import { useState, useEffect } from 'react';
import { AppError, toAppError } from '@/shared/lib/errors';

interface DashboardStats {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  productivity: number;
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock data for template - replace with actual API call
        const mockStats: DashboardStats = {
          totalProjects: 12,
          completedTasks: 124,
          pendingTasks: 8,
          productivity: 85,
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (mounted) {
          setData(mockStats);
        }
      } catch (err) {
        if (mounted) {
          setError(toAppError(err));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
