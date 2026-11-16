import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router'
import { RequireAuth } from '@/shared/auth/RequireAuth'
import type { Role } from '@/shared/auth/roles'

interface Options {
  auth?: boolean
  roles?: Role[]
}

export function lazyPage(
  load: () => Promise<ComponentType>,
  { auth = false, roles }: Options = {},
): Pick<RouteObject, 'lazy'> {
  return {
    lazy: async () => {
      const Page = await load()
      if (!auth && !roles) return { Component: Page }
      return {
        element: (
          <RequireAuth roles={roles}>
            <Page />
          </RequireAuth>
        ),
      }
    },
  }
}
