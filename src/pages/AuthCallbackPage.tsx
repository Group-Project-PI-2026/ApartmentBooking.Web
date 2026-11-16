import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from 'react-oidc-context'
import { consumeReturnTo } from '@/shared/auth'

export function AuthCallbackPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isLoading) return
    void navigate(auth.error ? '/' : consumeReturnTo(), { replace: true })
  }, [auth.isLoading, auth.error, navigate])

  return null
}
