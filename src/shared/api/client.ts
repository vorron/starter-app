import { ApiError, toAppError } from "@/shared/lib/errors";
import { config } from "@/shared/lib/config";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = 10000, body, headers, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: {
          message: string;
          code?: string;
          userMessage?: string;
          details?: unknown;
        } = { message: response.statusText };

        try {
          errorData = await response.json();
        } catch {
          // Ignore JSON parse errors for non-JSON responses
        }

        throw new ApiError(
          errorData.message || `HTTP Error ${response.status}`,
          response.status,
          errorData.code,
          errorData.userMessage,
          errorData.details
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw toAppError(error);
    }
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

export const apiClient = new ApiClient(config.apiUrl);
