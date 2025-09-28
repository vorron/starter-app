// src/shared/lib/config.ts (расширенная версия)
class AppConfig {
  private requiredEnvVars = ['NEXT_PUBLIC_API_URL'] as const;

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    if (typeof window === 'undefined') {
      // Server-side validation
      this.requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar] && this.isProduction) {
          throw new Error(`Missing required environment variable: ${envVar}`);
        }
      });
    }
  }

  get apiUrl(): string {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url && this.isProduction) {
      throw new Error('NEXT_PUBLIC_API_URL is required in production');
    }
    return url || 'http://localhost:3001/api';
  }

  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  get isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  get apiTimeout(): number {
    return parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10);
  }

  get apiRetries(): number {
    return parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '2', 10);
  }

  get logLevel(): string {
    return process.env.NEXT_PUBLIC_LOG_LEVEL || (this.isProduction ? 'error' : 'debug');
  }
}

export const config = new AppConfig();