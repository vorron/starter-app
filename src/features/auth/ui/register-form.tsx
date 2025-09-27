'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useAuthActions, useAuthError, useAuthLoading } from '@/entities/session/model/session.store'
import { emailValidator, passwordValidator } from '@/shared/lib/utils'


export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const { register } = useAuthActions()
  const error = useAuthError()
  const isLoading = useAuthLoading()
  const router = useRouter()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailValidator(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (!passwordValidator(formData.password)) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await register(formData.email, formData.password, formData.name)
      router.push('/dashboard')
    } catch  {
      // Error handled by store
    }
  }

  const getFieldError = (fieldName: string) => 
    validationErrors[fieldName] || (error?.field === fieldName ? error.message : '')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && !error.field && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error.userMessage || error.message}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Full Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={getFieldError('name') ? 'border-destructive' : ''}
        />
        {getFieldError('name') && (
          <p className="text-destructive text-xs">{getFieldError('name')}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={getFieldError('email') ? 'border-destructive' : ''}
        />
        {getFieldError('email') && (
          <p className="text-destructive text-xs">{getFieldError('email')}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={getFieldError('password') ? 'border-destructive' : ''}
        />
        {getFieldError('password') && (
          <p className="text-destructive text-xs">{getFieldError('password')}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={getFieldError('confirmPassword') ? 'border-destructive' : ''}
        />
        {getFieldError('confirmPassword') && (
          <p className="text-destructive text-xs">{getFieldError('confirmPassword')}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}