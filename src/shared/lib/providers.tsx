'use client';

import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthActions } from '@/entities/session/model/session.store';
import { ThemeProvider } from '../ui/theme-provider';
import { useSessionEvents } from '@/entities/session/model/useSessionEvents';
import { setupAuthEventListeners } from './auth-events';
import { config } from './config';
import { createQueryClient } from './query-client';

// Query Provider как отдельный компонент
const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {config.isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export function Providers({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthActions();

  useSessionEvents();

  useEffect(() => {
    checkAuth();
    setupAuthEventListeners();
  }, [checkAuth]);

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
