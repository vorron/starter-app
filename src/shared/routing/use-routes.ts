'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ROUTES} from './routes';
import { AppRoute } from './router-utils';

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();

  return {
    push: (route: AppRoute) => router.push(route),
    replace: (route: AppRoute) => router.replace(route),
    back: () => router.back(),
    pathname,
    ROUTES,
    isActive: (route: AppRoute) => pathname === route,
    isActiveStartsWith: (route: AppRoute) => pathname.startsWith(route),
  };
};

export const useProtectedRoutes = () => {
  const { push, replace } = useAppRouter();

  return {
    toDashboard: () => push(ROUTES.PROTECTED.DASHBOARD),
    toProfile: () => push(ROUTES.PROTECTED.PROFILE),
    replaceToDashboard: () => replace(ROUTES.PROTECTED.DASHBOARD),
  };
};

export const usePublicRoutes = () => {
  const { push } = useAppRouter();

  return {
    toHome: () => push(ROUTES.PUBLIC.HOME),
    toLogin: () => push(ROUTES.PUBLIC.LOGIN),
    toRegister: () => push(ROUTES.PUBLIC.REGISTER),
  };
};
