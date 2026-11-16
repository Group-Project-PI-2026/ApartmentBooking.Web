import type { RouteObject } from 'react-router'
import { RequireAuth, Role } from '@/shared/auth'
import { lazyPage } from '@/shared/routes/lazyPage'
import { PagePlaceholder } from '@/shared/ui'
import { propertyPaths as p } from './paths'

export const propertyPublicRoutes: RouteObject[] = [
  {
    path: p.owners,
    ...lazyPage(() => import('./pages/OwnersPage/OwnersPage').then((m) => m.OwnersPage)),
  },
  {
    path: p.ownerApply,
    ...lazyPage(
      () => import('./pages/OwnerApplyPage/OwnerApplyPage').then((m) => m.OwnerApplyPage),
      { auth: true },
    ),
  },
  {
    path: p.myRequests,
    ...lazyPage(
      () => import('./pages/MyRequestsPage/MyRequestsPage').then((m) => m.MyRequestsPage),
      { auth: true },
    ),
  },
  {
    path: p.myRequestDetails,
    ...lazyPage(() => import('./pages/MyRequestPage/MyRequestPage').then((m) => m.MyRequestPage), {
      auth: true,
    }),
  },
]

export const propertyCabinetRoutes: RouteObject[] = [
  {
    path: p.ownerObjects,
    element: (
      <RequireAuth roles={[Role.Owner]}>
        <PagePlaceholder title="Мої об’єкти" screen="17, 17B" />
      </RequireAuth>
    ),
  },
  {
    path: p.ownerObjectDetails,
    element: (
      <RequireAuth roles={[Role.Owner]}>
        <PagePlaceholder title="Інформація про об’єкт" screen="17A" />
      </RequireAuth>
    ),
  },
  {
    path: p.ownerStatistics,
    element: (
      <RequireAuth roles={[Role.Owner]}>
        <PagePlaceholder title="Статистика" screen="18, 18A" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerApartments,
    ...lazyPage(
      () =>
        import('./pages/ManagerApartmentsPage/ManagerApartmentsPage').then(
          (m) => m.ManagerApartmentsPage,
        ),
      { roles: [Role.Manager] },
    ),
  },
  {
    path: p.managerApartmentNew,
    ...lazyPage(
      () => import('./pages/ApartmentFormPage/ApartmentFormPage').then((m) => m.ApartmentFormPage),
      { roles: [Role.Manager] },
    ),
  },
  {
    path: p.managerApartmentEdit,
    ...lazyPage(
      () => import('./pages/ApartmentFormPage/ApartmentFormPage').then((m) => m.ApartmentFormPage),
      { roles: [Role.Manager] },
    ),
  },
  {
    path: p.managerRequests,
    ...lazyPage(
      () =>
        import('./pages/ManagerRequestsPage/ManagerRequestsPage').then(
          (m) => m.ManagerRequestsPage,
        ),
      { roles: [Role.Manager] },
    ),
  },
  {
    path: p.managerRequestDetails,
    ...lazyPage(
      () =>
        import('./pages/ManagerRequestPage/ManagerRequestPage').then((m) => m.ManagerRequestPage),
      { roles: [Role.Manager] },
    ),
  },
  {
    path: p.adminUsers,
    element: (
      <RequireAuth roles={[Role.Admin]}>
        <PagePlaceholder title="Користувачі" screen="26, 26A" />
      </RequireAuth>
    ),
  },
  {
    path: p.adminUserDetails,
    element: (
      <RequireAuth roles={[Role.Admin]}>
        <PagePlaceholder title="Користувач" screen="27, 27A-27F" />
      </RequireAuth>
    ),
  },
]
