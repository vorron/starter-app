import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { config } from '../config';
import { toAppError, isApiError, isUnauthorizedError } from '../errors';

export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const appError = toAppError(error);

        // Автоматический logout только для определенных ошибок
        if (isUnauthorizedError(appError) && !query.meta?.skipAuthRedirect) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-logout'));
          }
        }

        // Логируем ошибки в продакшене
        if (config.isProduction) {
          console.error('Query error:', {
            queryKey: query.queryKey,
            error: appError,
            meta: query.meta,
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        const appError = toAppError(error);

        if (config.isProduction) {
          console.error('Mutation error:', {
            mutationKey: mutation.options.mutationKey,
            error: appError,
            variables,
            context,
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: config.queryStaleTime,
        gcTime: config.queryStaleTime * 2, // Время хранения в кэше
        retry: (failureCount, error) => {
          const appError = toAppError(error);

          // Не повторяем для клиентских ошибок
          if (isApiError(appError) && appError.status >= 400 && appError.status < 500) {
            return false;
          }

          return failureCount < config.maxQueryRetries;
        },
        refetchOnWindowFocus: config.isProduction,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: (failureCount, error) => {
          const appError = toAppError(error);

          // Никогда не повторяем мутации для клиентских ошибок
          if (isApiError(appError) && appError.status >= 400 && appError.status < 500) {
            return false;
          }

          return failureCount < config.maxMutationRetries;
        },
      },
    },
  });
};
