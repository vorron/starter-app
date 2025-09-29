import { toAppError, isApiError } from '../errors';
import { config } from '../config';

export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  // Используем toAppError вместо создания нового экземпляра
  const appError = toAppError(error);

  if (isApiError(appError)) {
    if (appError.status >= 400 && appError.status < 500 && appError.status !== 401) {
      return false;
    }
  }

  return failureCount < config.maxQueryRetries;
};

export const shouldRetryMutation = (failureCount: number, error: unknown) => {
  const appError = toAppError(error);

  if (isApiError(appError) && appError.status >= 400 && appError.status < 500) {
    return false;
  }

  return failureCount < config.maxMutationRetries;
};

export const RetryStrategies = {
  query: shouldRetryQuery,
  mutation: shouldRetryMutation,
} as const;
