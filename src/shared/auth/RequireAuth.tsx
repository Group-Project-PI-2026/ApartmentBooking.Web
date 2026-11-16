import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { paths } from '@/shared/routes/paths'
import type { Role } from './roles'
import { useCurrentUser } from './useCurrentUser'

interface Props {
  roles?: Role[]
  children: ReactNode
}

export function RequireAuth({ roles, children }: Props) {
  const { isLoading, isAuthenticated, hasRole, login } = useCurrentUser()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) void login()
  }, [isLoading, isAuthenticated, login])

  if (isLoading || !isAuthenticated) return null
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to={paths.forbidden} replace />
  }

  return children
}
