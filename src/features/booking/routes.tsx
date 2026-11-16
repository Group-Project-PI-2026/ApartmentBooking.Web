import type { RouteObject } from 'react-router'
import { RequireAuth, Role } from '@/shared/auth'
import { lazyPage } from '@/shared/routes/lazyPage'
import { PagePlaceholder } from '@/shared/ui'
import { bookingPaths as p } from './paths'

const tenant = { roles: [Role.Tenant] }
const manager = { roles: [Role.Manager] }

export const bookingHomeRoute: RouteObject = {
  index: true,
  ...lazyPage(() => import('./pages/HomePage/HomePage').then((m) => m.HomePage)),
}

export const bookingPublicRoutes: RouteObject[] = [
  {
    path: p.search,
    ...lazyPage(() => import('./pages/SearchPage/SearchPage').then((m) => m.SearchPage)),
  },
  {
    path: p.apartment,
    ...lazyPage(() => import('./pages/ApartmentPage/ApartmentPage').then((m) => m.ApartmentPage)),
  },
  {
    path: p.checkout,
    ...lazyPage(
      () => import('./pages/CheckoutPage/CheckoutPage').then((m) => m.CheckoutPage),
      tenant,
    ),
  },
  {
    path: p.paymentSuccess,
    ...lazyPage(
      () => import('./pages/PaymentStatusPage/PaymentStatusPage').then((m) => m.PaymentStatusPage),
      tenant,
    ),
  },
  {
    path: p.bookingDetails,
    ...lazyPage(
      () =>
        import('./pages/BookingDetailsPage/BookingDetailsPage').then((m) => m.BookingDetailsPage),
      tenant,
    ),
  },
  {
    path: p.cancelBooking,
    ...lazyPage(
      () => import('./pages/CancelBookingPage/CancelBookingPage').then((m) => m.CancelBookingPage),
      tenant,
    ),
  },
  {
    path: p.myBookings,
    ...lazyPage(
      () => import('./pages/MyBookingsPage/MyBookingsPage').then((m) => m.MyBookingsPage),
      tenant,
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
    path: p.profile,
    ...lazyPage(() => import('./pages/ProfilePage/ProfilePage').then((m) => m.ProfilePage), {
      auth: true,
    }),
  },
  {
    path: p.profileNotifications,
    ...lazyPage(
      () => import('./pages/ProfilePage/NotificationsPage').then((m) => m.NotificationsPage),
      { auth: true },
    ),
  },
  {
    path: p.managerCalendar,
    element: (
      <RequireAuth {...manager}>
        <PagePlaceholder title="Календар" screen="21" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerBookings,
    element: (
      <RequireAuth {...manager}>
        <PagePlaceholder title="Бронювання" screen="22" />
      </RequireAuth>
    ),
  },
  {
    path: p.managerBookingDetails,
    element: (
      <RequireAuth {...manager}>
        <PagePlaceholder title="Деталі бронювання" screen="23" />
      </RequireAuth>
    ),
  },
]
