import { useState } from 'react';

import { AppError, toAppError } from '@/shared/lib/errors';
import { ChangePasswordData, profileApi, UpdateProfileData } from '@/shared/api/endpoints/profile';

export function useProfileActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const updateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true);
    setError(null);
    try {
      return await profileApi.updateProfile(data);
    } catch (error) {
      const appError = toAppError(error);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    setIsLoading(true);
    setError(null);
    try {
      await profileApi.changePassword(data);
    } catch (error) {
      const appError = toAppError(error);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    changePassword,
    isLoading,
    error,
  };
}
