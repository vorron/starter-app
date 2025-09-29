import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001/api'),
  NEXTAUTH_SECRET: z.string().default('your-secret-key-here'),
  NEXT_PUBLIC_API_RETRIES: z.string().transform(Number).default(2),
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform(Number).default(10000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  QUERY_STALE_TIME: z.string().transform(Number).default(5),
  MAX_QUERY_RETRIES: z.string().transform(Number).default(2),
  MAX_MUTATION_RETRIES: z.string().transform(Number).default(1),
});

class AppConfig {
  private readonly env;

  constructor() {
    this.env = envSchema.parse(process.env);

    if (this.isProduction) {
      if (this.env.NEXTAUTH_SECRET === 'your-secret-key-here') {
        throw new Error('Change NEXTAUTH_SECRET in production');
      }
    }
  }

  get apiUrl() {
    return this.env.NEXT_PUBLIC_API_URL;
  }
  get apiRetries() {
    return this.env.NEXT_PUBLIC_API_RETRIES;
  }
  get apiTimeout() {
    return this.env.NEXT_PUBLIC_API_TIMEOUT;
  }
  get authSecret() {
    return this.env.NEXTAUTH_SECRET;
  }
  get isDevelopment() {
    return this.env.NODE_ENV === 'development';
  }
  get isProduction() {
    return this.env.NODE_ENV === 'production';
  }
  get isTest() {
    return this.env.NODE_ENV === 'test';
  }
  get queryStaleTime() {
    return this.env.QUERY_STALE_TIME * 60 * 1000;
  }
  get maxQueryRetries() {
    return this.env.MAX_QUERY_RETRIES;
  }
  get maxMutationRetries() {
    return this.env.MAX_MUTATION_RETRIES;
  }
}

export const config = new AppConfig();
