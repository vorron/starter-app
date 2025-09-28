import { useState } from 'react'
import { useSessionStore } from '@/entities/session/model/session.store' // Исправить импорт
import { apiClient } from '@/shared/api/client'
import { AppError, toAppError } from '@/shared/lib/errors'
import { User } from '@/entities/user/model/types' // Добавить импорт

interface UpdateProfileData {
  name: string
  email: string
}

export function useProfileActions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  
  // Использовать правильное хранилище
  const user = useSessionStore(state => state.user)
  const updateUser = useSessionStore(state => state.updateUser)

  const updateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Добавить типизацию
      const updatedUser = await apiClient.put<User>(`/users/${user?.id}`, data)
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
      // Типизировать ответ если нужно
      await apiClient.post<{ success: boolean }>('/auth/change-password', {
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