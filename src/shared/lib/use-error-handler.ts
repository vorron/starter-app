import { useState, useCallback } from 'react'
import { AppError, toAppError, isApiError } from './errors'

interface UseErrorHandlerReturn {
  error: AppError | null
  clearError: () => void
  handleError: (error: unknown) => void
  withErrorHandling: <T>(promise: Promise<T>) => Promise<T>
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const handleError = useCallback((error: unknown) => {
    const appError = toAppError(error)
    setError(appError)
    
    // Дополнительная логика обработки (тосты, логирование и т.д.)
    if (isApiError(appError) && appError.status === 401) {
      // Логика логаута будет в session store
    }
  }, [])

  const withErrorHandling = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      clearError()
      return await promise
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [clearError, handleError])

  return {
    error,
    clearError,
    handleError,
    withErrorHandling,
  }
}