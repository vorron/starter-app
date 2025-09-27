import { AppError, ApiError } from '@/shared/lib/errors'

/**
 * Безопасно извлекает сообщение об ошибке
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

/**
 * Безопасно извлекает user-friendly сообщение
 */
export function getUserErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage
  return getErrorMessage(error)
}

/**
 * Безопасно извлекает код ошибки
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) return error.code
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code
    return typeof code === 'string' ? code : undefined
  }
  
  return undefined
}

/**
 * Проверяет, является ли ошибка сетевой
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Failed to fetch') || 
    error.message.includes('Network request failed') ||
    error.name === 'NetworkError'
  )
}

/**
 * Создает объект ошибки из различных форматов
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  const message = getErrorMessage(error)
  return new ApiError(message, 0, 'UNKNOWN_ERROR')
}