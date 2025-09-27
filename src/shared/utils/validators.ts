export const emailValidator = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const passwordValidator = (password: string): boolean => {
  return password.length >= 6
}

export const nameValidator = (name: string): boolean => {
  return name.trim().length >= 2
}

export const confirmPasswordValidator = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}