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
    element: (
      <RequireAuth>
        <PagePlaceholder title="Заявка на співпрацю" screen="15, 15A-15C" />
      </RequireAuth>
    ),
  },
  {
    path: p.myRequests,
    element: (
      <RequireAuth>
        <PagePlaceholder title="Мої заявки" screen="16" />
      </RequireAuth>
    ),
  },
  {
    path: p.myRequestDetails,
    element: (
      <RequireAuth>
        <PagePlaceholder title="Моя заявка" screen="16, 16A-16C" />
      </RequireAuth>
    ),
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
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Апартаменти" screen="19, 19A-19F" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerApartmentNew,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Додати апартаменти" screen="20, 20B-20D" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerApartmentEdit,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Редагувати апартаменти" screen="20A" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerRequests,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Заявки на співпрацю" screen="24, 24A-24E" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerRequestDetails,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Розгляд заявки" screen="25, 25A-25F" />
      </RequireAuth>
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
