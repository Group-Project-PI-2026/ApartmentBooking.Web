import { createBrowserRouter } from 'react-router'
import {
  bookingCabinetRoutes,
  bookingHomeRoute,
  bookingPublicRoutes,
} from '@/features/booking/routes'
import { propertyCabinetRoutes, propertyPublicRoutes } from '@/features/property/routes'
import { CabinetLayout } from '@/layouts/CabinetLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { paths } from '@/shared/routes/paths'

export const router = createBrowserRouter([
  { path: paths.authCallback, element: <AuthCallbackPage /> },
  {
    path: paths.home,
    element: <PublicLayout />,
    children: [
      bookingHomeRoute,
      ...bookingPublicRoutes,
      ...propertyPublicRoutes,
      { path: paths.forbidden, element: <ForbiddenPage /> },
      ...(import.meta.env.DEV
        ? [
            {
              path: '/dev/ui',
              lazy: async () => ({ Component: (await import('@/pages/UiKitPage')).UiKitPage }),
            },
          ]
        : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <CabinetLayout />,
    children: [...bookingCabinetRoutes, ...propertyCabinetRoutes],
  },
])
