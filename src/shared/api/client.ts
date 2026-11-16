import createClient, { type Middleware } from 'openapi-fetch'
import { env } from '@/shared/config/env'
import { userManager } from '@/shared/auth/userManager'
import type { paths } from './schema'

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const user = await userManager.getUser()
    if (user?.access_token && !user.expired) {
      request.headers.set('Authorization', `Bearer ${user.access_token}`)
    }
    return request
  },
}

export const api = createClient<paths>({ baseUrl: env.apiBaseUrl })
api.use(authMiddleware)
