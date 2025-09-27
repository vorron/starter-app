// Базовый класс для всех ошибок приложения
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly status: number
  abstract readonly userMessage: string
  public readonly field?: string // Добавляем опциональное поле
  
  constructor(message: string, field?: string) {
    super(message)
    this.name = this.constructor.name
    this.field = field
  }
}

// Сетевые ошибки
export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR'
  readonly status = 0
  readonly userMessage = 'Проблемы с соединением. Проверьте интернет.'

  constructor(message: string = 'Network error occurred') {
    super(message)
  }
}

export class TimeoutError extends AppError {
  readonly code = 'TIMEOUT_ERROR'
  readonly status = 408
  readonly userMessage = 'Превышено время ожидания. Попробуйте снова.'

  constructor(message: string = 'Request timeout') {
    super(message)
  }
}

interface ErrorWithStatus {
  status: number
  message: string
  code?: string
  userMessage?: string
  details?: unknown
  field?: string // Добавляем поддержку field-specific ошибок
}

// Ошибки API
export class ApiError extends AppError {
  readonly userMessage: string
  public readonly details?: unknown

  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string = 'API_ERROR',
    userMessage?: string,
    details?: unknown,
    field?: string // Добавляем field параметр
  ) {
    super(message, field) // Передаем field в родительский класс
    this.userMessage = userMessage || this.getDefaultUserMessage(status)
    this.details = details
  }

  private getDefaultUserMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Неверный запрос.',
      401: 'Требуется авторизация.',
      403: 'Доступ запрещен.',
      404: 'Ресурс не найден.',
      409: 'Конфликт данных.',
      422: 'Ошибка валидации.',
      429: 'Слишком много запросов.',
      500: 'Внутренняя ошибка сервера.',
      502: 'Проблемы с сервером.',
      503: 'Сервис временно недоступен.',
    }
    
    return messages[status] || 'Произошла ошибка. Попробуйте снова.'
  }
}

// Ошибки валидации
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly status = 400
  readonly userMessage: string

  constructor(message: string, public readonly field?: string) {
    super(message, field)
    this.userMessage = field 
      ? `Ошибка в поле "${field}": ${message}`
      : `Ошибка валидации: ${message}`
  }
}


// Type guards для безопасной проверки типов
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as ErrorWithStatus).status === 'number' &&
    typeof (error as ErrorWithStatus).message === 'string'
  )
}

// Утилита для безопасного создания ошибок из неизвестных значений
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new TimeoutError(error.message)
    }
    
    // Безопасное извлечение field из ошибки
    if (isErrorWithStatus(error)) {
      return new ApiError(
        error.message,
        error.status,
        typeof error.code === 'string' ? error.code : undefined,
        typeof error.userMessage === 'string' ? error.userMessage : undefined,
        error.details,
        typeof error.field === 'string' ? error.field : undefined // Извлекаем field
      )
    }

    // Проверяем, является ли error объектом с полями
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>

      // Пытаемся извлечь статус и сообщение из различных возможных форматов
      const status = Number(errorObj.status || errorObj.statusCode || 0)
      const message = String(errorObj.message || errorObj.error || error.toString())

      if (status > 0) {
        return new ApiError(
          message,
          status,
          typeof errorObj.code === 'string' ? errorObj.code : undefined,
          typeof errorObj.userMessage === 'string' ? errorObj.userMessage : undefined,
          errorObj.details,
          typeof errorObj.field === 'string' ? errorObj.field : undefined  // Извлекаем field
        )
      }
    }

    return new NetworkError(error.message)
  }

  return new NetworkError(String(error))
}