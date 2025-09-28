'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryCache, MutationCache, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { useAuthActions } from '@/entities/session/model/session.store'
import { isApiError } from '@/shared/lib/errors'
import { ThemeProvider } from '../ui/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        // Глобальная обработка ошибок запросов
        console.error('Query error:', error)
        
        if (isApiError(error) && error.status === 401) {
          console.warn('Authentication error detected in query')
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        // Глобальная обработка ошибок мутаций
        console.error('Mutation error:', error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 минут
        retry: (failureCount, error) => {
          // Используем нашу систему ошибок
          if (isApiError(error)) {
            // Не повторяем запрос при клиентских ошибках (кроме 401)
            if (error.status >= 400 && error.status < 500 && error.status !== 401) {
              return false
            }
          }
          
          // Для сетевых ошибок и серверных ошибок - повторяем до 2 раз
          return failureCount < 2
        },
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
      mutations: {
        retry: (failureCount, error) => {
          // Для мутаций меньше повторных попыток
          if (isApiError(error) && error.status >= 400 && error.status < 500) {
            return false
          }
          return failureCount < 1
        },
      },
    },
  }))

  const { checkAuth } = useAuthActions()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}