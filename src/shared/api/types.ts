import { User } from "@/entities/user/model/types";

// src/shared/api/types.ts
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Для пользовательских endpoints
export type UserResponse = ApiResponse<User>;
