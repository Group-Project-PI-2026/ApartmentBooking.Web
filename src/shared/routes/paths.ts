import { AUTH_CALLBACK_PATH } from '@/shared/auth/userManager'

export const paths = {
  home: '/',
  authCallback: AUTH_CALLBACK_PATH,
  forbidden: '/403',
} as const
