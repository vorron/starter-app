// Базовый класс для всех ошибок приложения
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly status: number;
  abstract readonly userMessage: string;
  public readonly field?: string; // Добавляем опциональное поле

  constructor(message: string, field?: string) {
    super(message);
    this.name = this.constructor.name;
    this.field = field;
  }
}

// Сетевые ошибки
export class NetworkError extends AppError {
  readonly code = "NETWORK_ERROR";
  readonly status = 0;
  readonly userMessage = "Проблемы с соединением. Проверьте интернет.";

  constructor(message: string = "Network error occurred") {
    super(message);
  }
}

export class TimeoutError extends AppError {
  readonly code = "TIMEOUT_ERROR";
  readonly status = 408;
  readonly userMessage = "Превышено время ожидания. Попробуйте снова.";

  constructor(message: string = "Request timeout") {
    super(message);
  }
}

// Ошибки API
export class ApiError extends AppError {
  readonly userMessage: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string = "API_ERROR",
    userMessage?: string,
    details?: unknown,
    field?: string // Добавляем field параметр
  ) {
    super(message, field); // Передаем field в родительский класс
    this.userMessage = userMessage || this.getDefaultUserMessage(status);
    this.details = details;
  }

  private getDefaultUserMessage(status: number): string {
    const messages: Record<number, string> = {
      400: "Неверный запрос.",
      401: "Требуется авторизация.",
      403: "Доступ запрещен.",
      404: "Ресурс не найден.",
      409: "Конфликт данных.",
      422: "Ошибка валидации.",
      429: "Слишком много запросов.",
      500: "Внутренняя ошибка сервера.",
      502: "Проблемы с сервером.",
      503: "Сервис временно недоступен.",
    };

    return messages[status] || "Произошла ошибка. Попробуйте снова.";
  }
}

// Ошибки валидации
export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly status = 400;
  readonly userMessage: string;

  constructor(message: string, public readonly field?: string) {
    super(message, field);
    this.userMessage = field
      ? `Ошибка в поле "${field}": ${message}`
      : `Ошибка валидации: ${message}`;
  }
}

// Type guards для безопасной проверки типов
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

// Сначала определим интерфейс для ошибок API с дополнительными полями
interface ApiErrorResponse {
  message: string;
  status?: number;
  statusCode?: number;
  code?: string;
  userMessage?: string;
  details?: unknown;
  field?: string;
}

// Type guard для проверки, что ошибка имеет структуру ApiErrorResponse
function isApiErrorResponse(error: unknown): error is Error & ApiErrorResponse {
  if (!(error instanceof Error)) {
    return false;
  }

  // Безопасная проверка через временное приведение
  const potentialApiError = error as Partial<ApiErrorResponse>;

  return (
    typeof potentialApiError.message === "string" &&
    (typeof potentialApiError.status === "number" ||
      typeof potentialApiError.statusCode === "number" ||
      typeof potentialApiError.code === "string" ||
      typeof potentialApiError.userMessage === "string")
  );
}

// Обновленная функция toAppError
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return new TimeoutError(error.message);
    }

    // Используем наш type guard
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

    // Безопасное извлечение свойств через проверку типа
    if (typeof error === "object" && error !== null) {
      // Корректное приведение типов через unknown
      const errorObj = error as unknown as Record<string, unknown>;

      const status =
        getNumberProperty(errorObj, "status") ||
        getNumberProperty(errorObj, "statusCode") ||
        0;

      const message =
        getStringProperty(errorObj, "message") ||
        getStringProperty(errorObj, "error") ||
        error.message;

      if (status > 0) {
        return new ApiError(
          message,
          status,
          getStringProperty(errorObj, "code"),
          getStringProperty(errorObj, "userMessage"),
          errorObj.details,
          getStringProperty(errorObj, "field")
        );
      }
    }

    return new NetworkError(error.message);
  }

  // Обработка примитивных типов
  if (typeof error === "string") {
    return new NetworkError(error);
  }

  if (typeof error === "number") {
    return new ApiError(`Error ${error}`, 0, "UNKNOWN_ERROR");
  }

  return new NetworkError("An unknown error occurred");
}

// Улучшенные вспомогательные функции
function getStringProperty(obj: unknown, prop: string): string | undefined {
  if (typeof obj !== "object" || obj === null) return undefined;

  const value = (obj as Record<string, unknown>)[prop];
  return typeof value === "string" ? value : undefined;
}

function getNumberProperty(obj: unknown, prop: string): number | undefined {
  if (typeof obj !== "object" || obj === null) return undefined;

  const value = (obj as Record<string, unknown>)[prop];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}
