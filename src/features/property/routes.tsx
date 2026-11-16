import type { RouteObject } from 'react-router'
import { Role } from '@/shared/auth'
import { lazyPage } from '@/shared/routes/lazyPage'
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
    ...lazyPage(
      () => import('./pages/OwnerObjectsPage/OwnerObjectsPage').then((m) => m.OwnerObjectsPage),
      { roles: [Role.Owner] },
    ),
  },
  {
    path: p.ownerObjectDetails,
    ...lazyPage(
      () => import('./pages/OwnerObjectPage/OwnerObjectPage').then((m) => m.OwnerObjectPage),
      { roles: [Role.Owner] },
    ),
  },
  {
    path: p.ownerStatistics,
    ...lazyPage(
      () =>
        import('./pages/OwnerStatisticsPage/OwnerStatisticsPage').then(
          (m) => m.OwnerStatisticsPage,
        ),
      { roles: [Role.Owner] },
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
    ...lazyPage(
      () => import('./pages/AdminUsersPage/AdminUsersPage').then((m) => m.AdminUsersPage),
      { roles: [Role.Admin] },
    ),
  },
  {
    path: p.adminUserDetails,
    ...lazyPage(() => import('./pages/AdminUserPage/AdminUserPage').then((m) => m.AdminUserPage), {
      roles: [Role.Admin],
    }),
  },
]
