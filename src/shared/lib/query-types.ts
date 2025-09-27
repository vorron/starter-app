// src/shared/lib/query-types.ts
import { AppError, isApiError } from './errors'

// Расширяем типы TanStack Query для лучшей интеграции с нашей системой ошибок
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError
  }
}

// Утилита для безопасного извлечения сообщения об ошибке из запросов
export function getQueryErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.userMessage
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unknown error occurred'
}

// Хук для удобной работы с ошибками в компонентах
export function useQueryErrorHandler() {
  const handleError = (error: unknown) => {
    if (isApiError(error)) {
      // Можно добавить логику показа уведомлений
      console.error('API Error:', error.message, error.status)
    } else {
      console.error('Error:', error)
    }
  }
  
  return { handleError }
}