import { useCallback, useMemo } from 'react'
import { useAuth } from 'react-oidc-context'
import { env } from '@/shared/config/env'
import { Role, extractRoles } from './roles'
import { RETURN_TO_KEY } from './userManager'

export function useCurrentUser() {
  const auth = useAuth()
  const accessToken = auth.user?.access_token

  const roles = useMemo(() => extractRoles(accessToken, env.oidcClientId), [accessToken])

  const hasRole = useCallback(
    (...required: Role[]) => roles.includes(Role.Admin) || required.some((r) => roles.includes(r)),
    [roles],
  )

  const { signinRedirect, signoutRedirect } = auth

  const login = useCallback(
    (returnTo: string = window.location.pathname + window.location.search) => {
      sessionStorage.setItem(RETURN_TO_KEY, returnTo)
      return signinRedirect()
    },
    [signinRedirect],
  )

  const logout = useCallback(() => signoutRedirect(), [signoutRedirect])

  const runAccountAction = useCallback(
    (action: 'UPDATE_PASSWORD' | 'UPDATE_PROFILE', returnTo: string = window.location.pathname) => {
      sessionStorage.setItem(RETURN_TO_KEY, returnTo)
      return signinRedirect({ extraQueryParams: { kc_action: action } })
    },
    [signinRedirect],
  )

  return {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    profile: auth.user?.profile,
    roles,
    hasRole,
    login,
    logout,
    runAccountAction,
  }
}
