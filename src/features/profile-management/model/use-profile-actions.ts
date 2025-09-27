import { useState } from 'react'
import { useUserStore } from '@/entities/user/model/user.store' // Импортируем хранилище
import { apiClient } from '@/shared/api/client'
import { AppError, toAppError } from '@/shared/lib/errors'

interface UpdateProfileData {
  name: string
  email: string
}

export function useProfileActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  
  // Правильно получаем пользователя и действия из хранилища
  const user = useUserStore(state => state.user)
  const updateUser = useUserStore(state => state.updateUser)

  const updateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await apiClient.put(`/users/${user?.id}`, data)
      updateUser(updatedUser)
      return updatedUser
    } catch (error) {
      const appError = toAppError(error)
      setError(appError)
      throw appError
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
    } catch (error) {
      const appError = toAppError(error)
      setError(appError)
      throw appError
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateProfile,
    changePassword,
    isLoading,
    error,
  }
}