// src/shared/api/client.ts
import { 
  AppError, 
  ApiError, 
  toAppError,
  isApiError, 
  isTimeoutError,
  isNetworkError
} from '@/shared/lib/errors'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  timeout?: number
  skipErrorHandling?: boolean
  retries?: number
}

// Конфигурация клиента по умолчанию
interface ApiClientConfig {
  baseURL: string
  timeout: number
  retries: number
  headers: Record<string, string>
}

// Интерфейс для стандартизированного ответа об ошибке от API
interface ApiErrorResponse {
  message: string
  code?: string
  userMessage?: string
  details?: unknown
}

class ApiClient {
  private config: ApiClientConfig

  constructor(baseURL: string = '') {
    this.config = {
      baseURL,
      timeout: 10000,
      retries: 1,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  public configure(config: Partial<ApiClientConfig>) {
    this.config = { ...this.config, ...config }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryCount: number = 0
  ): Promise<T> {
    const {
      timeout = this.config.timeout,
      body,
      headers,
      skipErrorHandling = false,
      retries = this.config.retries,
      ...fetchOptions
    } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const url = `${this.config.baseURL}${endpoint}`
      
      const config: RequestInit = {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...this.config.headers,
          ...headers,
        },
        credentials: 'include',
      }

      if (body) {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      // Обрабатываем HTTP ошибки
      if (!response.ok) {
        let errorData: ApiErrorResponse
        
        try {
          errorData = await response.json() as ApiErrorResponse
        } catch {
          errorData = { 
            message: response.statusText || `HTTP Error ${response.status}` 
          }
        }

        throw new ApiError(
          errorData.message,
          response.status,
          errorData.code,
          errorData.userMessage, // Теперь это string | undefined
          errorData.details
        )
      }

      // Для пустых ответов
      if (response.status === 204) {
        return undefined as T
      }

      // Парсим JSON
      try {
        return await response.json() as T
      } catch (parseError) {
        throw new ApiError(
          'Failed to parse response',
          500,
          'PARSE_ERROR'
        )
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // Преобразуем неизвестную ошибку в AppError
      const appError = toAppError(error)

      // Логика повторных попыток для сетевых ошибок
      if (retryCount < retries && shouldRetry(appError)) {
        console.warn(`Retrying request (${retryCount + 1}/${retries})`)
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      // Пробрасываем ошибку дальше
      if (!skipErrorHandling) {
        this.handleGlobalError(appError)
      }
      
      throw appError
    }
  }

  private handleGlobalError(error: AppError) {
    // Глобальная обработка ошибок
    console.error('API Error:', error)
    
    if (isApiError(error) && error.status === 401) {
      // Перенаправление на логин будет в компонентах
    }
  }

  // Публичные методы API
  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }
}

// Вспомогательная функция для определения необходимости повторной попытки
function shouldRetry(error: AppError): boolean {
  return isNetworkError(error) || isTimeoutError(error) || 
         (isApiError(error) && error.status >= 500)
}

// Создаем и экспортируем инстанс клиента
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL)