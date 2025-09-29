// shared/routing/routes.ts
export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
  },
  PROTECTED: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
  },
} as const;
