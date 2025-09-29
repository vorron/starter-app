import { Query, Mutation } from '@tanstack/react-query';
import { toAppError } from '../errors';
import { getQueryErrorMessage, createErrorConfig, QueryErrorConfig } from './query-types';
import { config } from '../config';

export const handleQueryError = (error: unknown, query: Query<unknown, unknown, unknown>) => {
  const appError = toAppError(error);
  const errorConfig = createErrorConfig(
    (query.meta as { errorConfig?: QueryErrorConfig })?.errorConfig
  );

  console.error('Query error:', appError);

  if (appError.status === 401) {
    console.warn('Authentication error detected in query');
  }

  if (config.isProduction && errorConfig.showToast) {
    //const errorMessage = getQueryErrorMessage(appError, errorConfig.fallbackMessage);
    // TODO: Интегрировать с системой нотификаций
  }
};

export const handleMutationError = (
  error: unknown,
  _variables: unknown,
  _context: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>
) => {
  const appError = toAppError(error);
  const errorConfig = createErrorConfig(
    (mutation.meta as { errorConfig?: QueryErrorConfig })?.errorConfig
  );

  console.error('Mutation error:', appError);

  if (config.isDevelopment) {
    const errorMessage = getQueryErrorMessage(appError, errorConfig.fallbackMessage);
    console.warn('Mutation failed:', errorMessage);
  }
};

export const ErrorHandlers = {
  query: handleQueryError,
  mutation: handleMutationError,
} as const;
