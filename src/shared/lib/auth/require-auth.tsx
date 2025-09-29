'use client';

import { useAuthLoading, useUser } from '@/entities/session/model/session.store';
import { LoadingSpinner } from '@/shared/ui/loading-spinner';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const user = useUser();
  const isLoading = useAuthLoading();

  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
