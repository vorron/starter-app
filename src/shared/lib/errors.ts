// Base error class with proper typing
export abstract class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly userMessage: string;
  public readonly field?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    options: {
      code: string;
      status: number;
      userMessage?: string;
      field?: string;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.status = options.status;
    this.userMessage = options.userMessage || this.getDefaultUserMessage(options.status);
    this.field = options.field;
    this.details = options.details;
  }

  private getDefaultUserMessage(status: number): string {
    const messages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Authentication required. Please sign in.",
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
}

// Specific error types
export class NetworkError extends AppError {
  constructor(message: string = "Network error occurred") {
    super(message, {
      code: "NETWORK_ERROR",
      status: 0,
      userMessage: "Please check your internet connection and try again.",
    });
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = "Request timeout") {
    super(message, {
      code: "TIMEOUT_ERROR",
      status: 408,
      userMessage: "Request timed out. Please try again.",
    });
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    public readonly status: number,
    code: string = "API_ERROR",
    userMessage?: string,
    details?: unknown,
    field?: string
  ) {
    super(message, { code, status, userMessage, field, details });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, {
      code: "VALIDATION_ERROR",
      status: 400,
      userMessage: field ? `Field "${field}": ${message}` : `Validation error: ${message}`,
      field,
    });
  }
}

// Type guards with proper typing
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

// Interface for API error responses
interface ApiErrorResponse {
  message: string;
  code?: string;
  userMessage?: string;
  details?: unknown;
  field?: string;
  status?: number;
  statusCode?: number;
}

// Type guard for API error responses
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const potentialError = error as Partial<ApiErrorResponse>;
  return typeof potentialError.message === 'string';
}

// Type guard for Error-like objects
function isErrorLike(error: unknown): error is { message: string; name?: string } {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  
  const potentialError = error as { message: unknown };
  return typeof potentialError.message === 'string';
}

// Safe property access functions
function getSafeStringProperty(obj: unknown, prop: string): string | undefined {
  if (typeof obj !== 'object' || obj === null) return undefined;
  
  const value = (obj as Record<string, unknown>)[prop];
  return typeof value === 'string' ? value : undefined;
}

function getSafeNumberProperty(obj: unknown, prop: string): number | undefined {
  if (typeof obj !== 'object' || obj === null) return undefined;
  
  const value = (obj as Record<string, unknown>)[prop];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

function getSafeProperty(obj: unknown, prop: string): unknown {
  if (typeof obj !== 'object' || obj === null) return undefined;
  return (obj as Record<string, unknown>)[prop];
}

// Main error normalization function
export function toAppError(error: unknown): AppError {
  // If it's already an AppError, return as-is
  if (isAppError(error)) {
    return error;
  }

  // Handle native Error instances
  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return new TimeoutError(error.message);
    }

    // Check if it's a network error
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network request failed') ||
        error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError(error.message);
    }

    // Try to extract structured error information from the error object
    const status = getSafeNumberProperty(error, 'status') || 
                   getSafeNumberProperty(error, 'statusCode') || 0;
    
    const message = getSafeStringProperty(error, 'message') || 
                    error.message;

    if (status > 0) {
      return new ApiError(
        message,
        status,
        getSafeStringProperty(error, 'code'),
        getSafeStringProperty(error, 'userMessage'),
        getSafeProperty(error, 'details'),
        getSafeStringProperty(error, 'field')
      );
    }

    // Fallback to NetworkError for generic Errors
    return new NetworkError(error.message);
  }

  // Handle API error responses (plain objects)
  if (isApiErrorResponse(error)) {
    const status = error.status || error.statusCode || 0;
    return new ApiError(
      error.message,
      status,
      error.code,
      error.userMessage,
      error.details,
      error.field
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new NetworkError(error);
  }

  // Handle numeric error codes
  if (typeof error === 'number') {
    return new ApiError(`Error ${error}`, error, 'UNKNOWN_ERROR');
  }

  // Handle Error-like objects that aren't Error instances
  if (isErrorLike(error)) {
    return new NetworkError(error.message);
  }

  // Final fallback
  return new NetworkError('An unknown error occurred');
}

// Utility functions for common error scenarios
export function createValidationError(message: string, field?: string): ValidationError {
  return new ValidationError(message, field);
}

export function createApiError(
  message: string, 
  status: number, 
  options?: { code?: string; userMessage?: string; details?: unknown; field?: string }
): ApiError {
  return new ApiError(
    message,
    status,
    options?.code,
    options?.userMessage,
    options?.details,
    options?.field
  );
}