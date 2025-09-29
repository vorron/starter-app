import { jwtVerify } from 'jose';
import { SessionUserSchema, SessionUser } from './session-types';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Валидация через zod вместо опасного приведения типов
    const validatedUser = SessionUserSchema.parse(payload);
    return validatedUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
