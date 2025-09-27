export interface ApiError {
  message: string
  status: number
  code?: string
}

export class ApiClientError extends Error {
  public status: number
  public code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultOptions: RequestOptions

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
    this.defaultOptions = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = 10000,
      body,
      headers,
      ...fetchOptions
    } = { ...this.defaultOptions, ...options }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const url = `${this.baseURL}${endpoint}`
      const config: RequestInit = {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...this.defaultOptions.headers,
          ...headers,
        },
        credentials: 'include', // Для работы с cookies
      }

      if (body) {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }))

        throw new ApiClientError(
          errorData.message || 'API request failed',
          response.status,
          errorData.code
        )
      }

      // Для пустых ответов
      if (response.status === 204) {
        return undefined as T
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiClientError) {
        throw error
      }

      if (error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 408)
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

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

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL)