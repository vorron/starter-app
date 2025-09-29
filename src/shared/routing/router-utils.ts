import { ROUTES} from './routes';
import { redirect } from 'next/navigation';

// Типы
export type PublicRoute = (typeof ROUTES.PUBLIC)[keyof typeof ROUTES.PUBLIC];
export type ProtectedRoute = (typeof ROUTES.PROTECTED)[keyof typeof ROUTES.PROTECTED];
export type AppRoute = PublicRoute | ProtectedRoute;

// Константы для проверки
const PUBLIC_ROUTES = Object.values(ROUTES.PUBLIC) as PublicRoute[];
const PROTECTED_ROUTES = Object.values(ROUTES.PROTECTED) as ProtectedRoute[];

// Type guards
export const isPublicRoute = (route: string): route is PublicRoute => {
  return PUBLIC_ROUTES.includes(route as PublicRoute);
};

export const isProtectedRoute = (route: string): route is ProtectedRoute => {
  return PROTECTED_ROUTES.includes(route as ProtectedRoute);
};

// Утилиты для серверных компонентов
export const serverRedirect = (route: AppRoute) => {
  redirect(route);
};

export const getRouteParams = {
  profile: (userId: string) => `${ROUTES.PROTECTED.PROFILE}?id=${userId}`,
  // Можно добавить генерацию динамических путей
  // user: (id: string) => `/users/${id}`,
} as const;
