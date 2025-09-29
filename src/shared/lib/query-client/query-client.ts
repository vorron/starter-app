import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { config } from '../config';
import { toAppError, isApiError } from '../errors';

export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const appError = toAppError(error);
        console.error('Query error:', appError);

        // Автоматический logout при 401 ошибке
        if (isApiError(appError) && appError.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-logout'));
          }
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        const appError = toAppError(error);
        console.error('Mutation error:', appError);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: config.queryStaleTime,
        retry: (failureCount, error) => {
          const appError = toAppError(error);
          if (isApiError(appError)) {
            // Не повторяем для клиентских ошибок (кроме 408 timeout)
            if (appError.status >= 400 && appError.status < 500 && appError.status !== 408) {
              return false;
            }
          }
          return failureCount < config.maxQueryRetries;
        },
        refetchOnWindowFocus: config.isProduction,
      },
      mutations: {
        retry: (failureCount, error) => {
          const appError = toAppError(error);
          if (isApiError(appError) && appError.status >= 400 && appError.status < 500) {
            return false;
          }
          return failureCount < config.maxMutationRetries;
        },
      },
    },
  });
};
