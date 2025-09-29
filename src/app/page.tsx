// app/page.tsx (упрощенный вариант)

import { useAuthLoading } from '@/entities/session/model/session.store';
import { serverRedirect, ROUTES } from '@/shared/routing';

export default async function HomePage() {
    const isLoading = useAuthLoading();
  serverRedirect(isLoading ? ROUTES.PROTECTED.DASHBOARD : ROUTES.PUBLIC.LOGIN);
}
