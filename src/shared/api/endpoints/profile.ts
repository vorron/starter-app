import { apiClient } from '../client';
import { User } from '@/entities/user/model/types';

export interface UpdateProfileData {
  name: string;
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  updateProfile: (data: UpdateProfileData): Promise<User> => apiClient.put('/users/profile', data),

  changePassword: (data: ChangePasswordData): Promise<void> =>
    apiClient.post('/auth/change-password', data),
};
