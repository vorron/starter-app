// app/page.tsx (упрощенный вариант)

import { serverRedirect, ROUTES } from '@/shared/routing';
import { getServerSession } from '@/shared/session';

export default async function HomePage() {
  const session = await getServerSession();
  serverRedirect(session?.user ? ROUTES.PROTECTED.DASHBOARD : ROUTES.PUBLIC.LOGIN);
}
