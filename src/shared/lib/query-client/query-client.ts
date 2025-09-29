// lib/query-client/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { config } from '../config';
import { ErrorHandlers } from './error-handlers';
import { RetryStrategies } from './retry-strategies';

export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: ErrorHandlers.query,
    }),
    mutationCache: new MutationCache({
      onError: ErrorHandlers.mutation,
    }),
    defaultOptions: {
      queries: {
        staleTime: config.queryStaleTime,
        retry: RetryStrategies.query,
        refetchOnWindowFocus: config.isProduction,
      },
      mutations: {
        retry: RetryStrategies.mutation,
      },
    },
  });
};

export type QueryClientConfig = ReturnType<typeof createQueryClient>;
