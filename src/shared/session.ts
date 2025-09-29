import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { User } from '@/entities/user/model/types';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      user: payload as unknown as User,
      expires: new Date(payload.exp! * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
