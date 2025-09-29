// hooks/use-query-error.ts
'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { getQueryErrorMessage, createErrorConfig, QueryErrorConfig } from './query-types';
import { AppError } from '../errors';

export const useQueryError = () => {
  const getErrorMessage = useCallback(
    (error: unknown, fallbackMessage?: string) => getQueryErrorMessage(error, fallbackMessage),
    []
  );

  // Правильно расширяем типы опций
  const withQueryErrorHandling = useCallback<
    <TData, TError = AppError>(
      options: UseQueryOptions<TData, TError> & { errorConfig?: QueryErrorConfig }
    ) => UseQueryOptions<TData, TError>
  >(
    (options) => ({
      ...options,
      meta: {
        ...options.meta,
        errorConfig: createErrorConfig(options.errorConfig),
      },
    }),
    []
  );

  const withMutationErrorHandling = useCallback<
    <TData, TError = AppError, TVariables = void>(
      options: UseMutationOptions<TData, TError, TVariables> & { errorConfig?: QueryErrorConfig }
    ) => UseMutationOptions<TData, TError, TVariables>
  >(
    (options) => ({
      ...options,
      meta: {
        ...options.meta,
        errorConfig: createErrorConfig(options.errorConfig),
      },
    }),
    []
  );

  return {
    getErrorMessage,
    withQueryErrorHandling,
    withMutationErrorHandling,
  };
};

// Вспомогательные хуки с правильной типизацией
export const useTypedQuery = <TData, TError = AppError>(
  options: UseQueryOptions<TData, TError> & { errorConfig?: QueryErrorConfig }
) => {
  const { withQueryErrorHandling } = useQueryError();
  return useQuery(withQueryErrorHandling(options));
};

export const useTypedMutation = <TData, TError = AppError, TVariables = void>(
  options: UseMutationOptions<TData, TError, TVariables> & { errorConfig?: QueryErrorConfig }
) => {
  const { withMutationErrorHandling } = useQueryError();
  return useMutation(withMutationErrorHandling(options));
};
