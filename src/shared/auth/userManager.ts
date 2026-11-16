import { UserManager, WebStorageStateStore } from 'oidc-client-ts'
import { env } from '@/shared/config/env'

export const RETURN_TO_KEY = 'auth:returnTo'
export const AUTH_CALLBACK_PATH = '/auth/callback'

export const userManager = new UserManager({
  authority: env.oidcAuthority,
  client_id: env.oidcClientId,
  redirect_uri: `${window.location.origin}${AUTH_CALLBACK_PATH}`,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
})

export function onSigninCallback() {
  window.history.replaceState({}, document.title, window.location.pathname)
}

export function consumeReturnTo() {
  const returnTo = sessionStorage.getItem(RETURN_TO_KEY) ?? '/'
  sessionStorage.removeItem(RETURN_TO_KEY)
  return returnTo
}
