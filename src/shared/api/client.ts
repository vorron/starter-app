import { ApiError, toAppError, isApiError } from "@/shared/lib/errors";
import { config } from "@/shared/lib/config";
import { authApi } from "./endpoints/auth";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
  retryCount?: number;
}

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
}

interface ApiErrorResponse {
  message: string;
  code?: string;
  userMessage?: string;
  details?: unknown;
  field?: string;
}

class ApiClient {
  private config: ApiClientConfig;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor(customConfig?: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: config.apiUrl,
      timeout: config.apiTimeout,
      maxRetries: config.apiRetries,
      ...customConfig,
    };

    if (!this.config.baseURL && process.env.NODE_ENV !== "test") {
      console.warn("API baseURL is not configured. Using empty string.");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryCount: number = 0
  ): Promise<T> {
    const { 
      timeout = this.config.timeout, 
      body, 
      retryCount: maxRetries = this.config.maxRetries,
      ...fetchOptions 
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.config.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 401 errors with token refresh
        if (response.status === 401 && 
            endpoint !== '/auth/refresh' && 
            retryCount === 0 && 
            !this.isRefreshing) {
          try {
            await this.handleAuthError(options);
            // Retry the original request with new token
            return this.request<T>(endpoint, options, retryCount + 1);
          } catch (refreshError) {
            // If refresh fails, trigger global logout
            this.triggerGlobalLogout();
            throw refreshError;
          }
        }

        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: response.statusText || `HTTP Error ${response.status}`,
            code: `HTTP_${response.status}`,
            userMessage: this.getDefaultUserMessage(response.status),
          };
        }

        throw new ApiError(
          errorData.message,
          response.status,
          errorData.code,
          errorData.userMessage,
          errorData.details,
          errorData.field
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic for network errors and 5xx status codes
      if (retryCount < maxRetries && this.shouldRetry(error)) {
        console.warn(`Retrying request (${retryCount + 1}/${maxRetries})`);
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw toAppError(error);
    }
  }

  private async handleAuthError(originalRequest: RequestOptions): Promise<void> {
    if (this.isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise((resolve, reject) => {
        this.subscribeToRefresh((token) => {
          if (token) {
            originalRequest.headers = {
              ...originalRequest.headers,
              'Authorization': `Bearer ${token}`,
            };
            resolve();
          } else {
            reject(new ApiError('Authentication failed', 401, 'AUTH_FAILED'));
          }
        });
      });
    }

    this.isRefreshing = true;

    try {
      const { accessToken } = await authApi.refreshToken();
      this.notifyRefreshSubscribers(accessToken);
      
      // Update the original request with new token
      originalRequest.headers = {
        ...originalRequest.headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    } catch (error) {
      this.notifyRefreshSubscribers(null);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }
  }

  private subscribeToRefresh(callback: (token: string | null) => void) {
    this.refreshSubscribers.push(callback);
  }

  private notifyRefreshSubscribers(token: string | null) {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  private triggerGlobalLogout() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (!isApiError(error)) return true;
    
    // Retry on network errors and server errors (5xx)
    return error.status >= 500 || error.status === 0;
  }

  private getDefaultUserMessage(status: number): string {
    const messages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Your session has expired. Please sign in again.",
      403: "You don't have permission to perform this action.",
      404: "The requested resource was not found.",
      409: "This resource already exists.",
      422: "Validation failed. Please check your input.",
      429: "Too many requests. Please try again later.",
      500: "Internal server error. Please try again later.",
      502: "Bad gateway. Please try again later.",
      503: "Service unavailable. Please try again later.",
    };
    
    return messages[status] || "An unexpected error occurred. Please try again.";
  }

  public get<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  public patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }
}

export const apiClient = new ApiClient();