import type { RouteObject } from 'react-router'
import { RequireAuth, Role } from '@/shared/auth'
import { PagePlaceholder } from '@/shared/ui'
import { ApartmentPage } from './pages/ApartmentPage/ApartmentPage'
import { HomePage } from './pages/HomePage/HomePage'
import { SearchPage } from './pages/SearchPage/SearchPage'
import { bookingPaths as p } from './paths'

export const bookingHomeRoute: RouteObject = {
  index: true,
  element: <HomePage />,
}

export const bookingPublicRoutes: RouteObject[] = [
  { path: p.search, element: <SearchPage /> },
  { path: p.apartment, element: <ApartmentPage /> },
  {
    path: p.checkout,
    element: (
      <RequireAuth roles={[Role.Tenant]}>
        <PagePlaceholder title="Оформлення бронювання" screen="06, 07" />
      </RequireAuth>
    ),
  },
  {
    path: p.paymentSuccess,
    element: (
      <RequireAuth roles={[Role.Tenant]}>
        <PagePlaceholder title="Статус платежу" screen="08, 09" />
      </RequireAuth>
    ),
  },
  { path: p.help, element: <PagePlaceholder title="Контакти та допомога" screen="28" /> },
  {
    path: p.terms,
    element: <PagePlaceholder title="Умови бронювання та скасування" screen="29A" />,
  },
  { path: p.privacy, element: <PagePlaceholder title="Політика конфіденційності" screen="29B" /> },
]

export const bookingCabinetRoutes: RouteObject[] = [
  {
    path: p.myBookings,
    element: (
      <RequireAuth roles={[Role.Tenant]}>
        <PagePlaceholder title="Мої бронювання" screen="10, 10A" />
      </RequireAuth>
    ),
  },
  {
    path: p.bookingDetails,
    element: (
      <RequireAuth roles={[Role.Tenant]}>
        <PagePlaceholder title="Деталі бронювання" screen="09, 11, 11A" />
      </RequireAuth>
    ),
  },
  {
    path: p.profile,
    element: (
      <RequireAuth>
        <PagePlaceholder title="Профіль" screen="13, 13A, 13C, 13D" />
      </RequireAuth>
    ),
  },
  {
    path: p.profileNotifications,
    element: (
      <RequireAuth>
        <PagePlaceholder title="Сповіщення" screen="13B" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerCalendar,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Календар" screen="21" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerBookings,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Бронювання" screen="22" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerBookingDetails,
    element: (
      <RequireAuth roles={[Role.Manager]}>
        <PagePlaceholder title="Деталі бронювання" screen="23" />
      </RequireAuth>
    ),
  },
]
