// src/shared/lib/config.ts
class AppConfig {
  get apiUrl(): string {
    const url = process.env.NEXT_PUBLIC_API_URL
    if (!url) {
      throw new Error('NEXT_PUBLIC_API_URL is not defined')
    }
    return url
  }

  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}

export const config = new AppConfig()