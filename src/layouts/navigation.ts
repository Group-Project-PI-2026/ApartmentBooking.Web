import { bookingPaths } from '@/features/booking/paths'
import { propertyPaths } from '@/features/property/paths'
import { Role } from '@/shared/auth'

export interface NavItem {
  label: string
  to: string
}

export const headerNav: NavItem[] = [
  { label: 'Апартаменти у Києві', to: bookingPaths.search },
  { label: 'Власникам', to: propertyPaths.owners },
  { label: 'Допомога', to: bookingPaths.help },
]

export const footerNav: NavItem[] = [
  { label: 'Умови бронювання', to: bookingPaths.terms },
  { label: 'Політика конфіденційності', to: bookingPaths.privacy },
  { label: 'Контакти та допомога', to: bookingPaths.help },
]

export const sidebarNav: Record<Role, { title: string; items: NavItem[] }> = {
  [Role.Tenant]: {
    title: 'Орендар',
    items: [
      { label: 'Мої бронювання', to: bookingPaths.myBookings },
      { label: 'Профіль', to: bookingPaths.profile },
      { label: 'Сповіщення', to: bookingPaths.profileNotifications },
    ],
  },
  [Role.Owner]: {
    title: 'Власник',
    items: [
      { label: 'Мої об’єкти', to: propertyPaths.ownerObjects },
      { label: 'Статистика', to: propertyPaths.ownerStatistics },
      { label: 'Профіль', to: bookingPaths.profile },
    ],
  },
  [Role.Manager]: {
    title: 'Менеджер',
    items: [
      { label: 'Апартаменти', to: propertyPaths.managerApartments },
      { label: 'Календар', to: bookingPaths.managerCalendar },
      { label: 'Бронювання', to: bookingPaths.managerBookings },
      { label: 'Заявки', to: propertyPaths.managerRequests },
      { label: 'Профіль', to: bookingPaths.profile },
    ],
  },
  [Role.Admin]: {
    title: 'Адміністратор',
    items: [
      { label: 'Користувачі', to: propertyPaths.adminUsers },
      { label: 'Профіль', to: bookingPaths.profile },
    ],
  },
}

const rolePriority: Role[] = [Role.Admin, Role.Manager, Role.Owner, Role.Tenant]

export function primaryRole(roles: Role[]): Role {
  return rolePriority.find((r) => roles.includes(r)) ?? Role.Tenant
}
