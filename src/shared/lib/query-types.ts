import { AppError } from './errors';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

export function getQueryErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  return 'An unknown error occurred';
}
