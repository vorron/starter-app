import { AppError } from '../errors';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

// Вместо расширения интерфейсов, используем intersection types
export type QueryMetaWithErrorConfig = {
  errorConfig?: QueryErrorConfig;
};

export interface QueryErrorConfig {
  showToast?: boolean;
  toastDuration?: number;
  fallbackMessage?: string;
}

export type DefaultErrorConfig = Required<QueryErrorConfig>;

export function getQueryErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Произошла неизвестная ошибка'
): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export const createErrorConfig = (config: QueryErrorConfig = {}): DefaultErrorConfig => ({
  showToast: true,
  toastDuration: 5000,
  fallbackMessage: 'Что-то пошло не так',
  ...config,
});
