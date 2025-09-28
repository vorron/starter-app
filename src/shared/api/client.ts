import { ApiError, toAppError, isApiError } from "@/shared/lib/errors";
import { config } from "@/shared/lib/config";

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

class ApiClient {
  private config: ApiClientConfig;

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
        let errorData: { message: string; code?: string; userMessage?: string };

        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: response.statusText || `HTTP Error ${response.status}`,
          };
        }

        throw new ApiError(
          errorData.message,
          response.status,
          errorData.code,
          errorData.userMessage
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

  private shouldRetry(error: unknown): boolean {
    if (!isApiError(error)) return true;

    // Retry on network errors and server errors (5xx)
    return error.status >= 500 || error.status === 0;
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
