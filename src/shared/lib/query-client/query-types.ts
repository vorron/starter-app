import { AppError } from '../errors';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

// Утилиты для работы с ошибками запросов
export function getQueryErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

export function isQueryError(error: unknown): error is AppError {
  return error instanceof AppError;
}
