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
import { HydrateFallback } from '@/pages/HydrateFallback'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { lazyPage } from '@/shared/routes/lazyPage'
import { paths } from '@/shared/routes/paths'

export const router = createBrowserRouter([
  { path: paths.authCallback, element: <AuthCallbackPage /> },
  {
    path: paths.home,
    element: <PublicLayout />,
    HydrateFallback,
    children: [
      bookingHomeRoute,
      ...bookingPublicRoutes,
      ...propertyPublicRoutes,
      { path: paths.forbidden, element: <ForbiddenPage /> },
      ...(import.meta.env.DEV
        ? [
            {
              path: '/dev/ui',
              ...lazyPage(() => import('@/pages/UiKitPage').then((m) => m.UiKitPage)),
            },
          ]
        : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <CabinetLayout />,
    HydrateFallback,
    children: [...bookingCabinetRoutes, ...propertyCabinetRoutes],
  },
])
