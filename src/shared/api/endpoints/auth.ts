import { apiClient } from '../client';
import { User } from '@/entities/user/model/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  login: (credentials: LoginRequest): Promise<User> => apiClient.post('/auth/login', credentials),

  register: (credentials: RegisterRequest): Promise<User> =>
    apiClient.post('/auth/register', credentials),

  logout: (): Promise<void> => apiClient.post('/auth/logout'),

  getMe: (): Promise<User> => apiClient.get('/auth/me'),

  refreshToken: (): Promise<{ accessToken: string }> => apiClient.post('/auth/refresh'),
};
