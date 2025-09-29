import { cookies } from 'next/headers';
import { verifyToken } from './session-utils';
import { Session } from './session-types';

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const user = await verifyToken(token);

  if (!user) {
    return null;
  }

  return {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Пример
  };
}
