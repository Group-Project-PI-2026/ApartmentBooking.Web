import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Role } from '@/shared/auth'

export type IdentityState = 'Verified' | 'Pending' | 'NotVerified'

export interface AdminObject {
  id: string
  title: string
  district: string
  address: string
  ownerId: string | null
}

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  before: string
  after: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  identity: IdentityState
  approvedRequest: { number: string; status: string } | null
  log: AuditEntry[]
}

export interface AdminUserDetails extends AdminUser {
  objects: AdminObject[]
}

export interface AdminUserListItem extends AdminUser {
  objectsCount: number
}

export const roleLabel: Record<Role, string> = {
  [Role.Tenant]: 'Орендар',
  [Role.Owner]: 'Власник',
  [Role.Manager]: 'Менеджер',
  [Role.Admin]: 'Адміністратор',
}

export const identityLabel: Record<IdentityState, string> = {
  Verified: 'Підтверджено',
  Pending: 'На перевірці',
  NotVerified: 'Не підтверджено',
}

let users: AdminUser[] = [
  {
    id: 'u-tenant',
    name: 'Андрій Коваль',
    email: 'name@example.com',
    phone: '+380 XX XXX XX XX',
    role: Role.Tenant,
    identity: 'Verified',
    approvedRequest: null,
    log: [],
  },
  {
    id: 'u-owner',
    name: 'Олена Демонстраційна',
    email: 'owner@example.com',
    phone: '+380 XX XXX XX XX',
    role: Role.Owner,
    identity: 'Verified',
    approvedRequest: { number: 'OWN-0014', status: 'Схвалено' },
    log: [
      {
        id: 'l2',
        at: '2026-11-06T10:00:00',
        actor: 'Адміністратор (демо)',
        action: 'Прив’язка об’єкта',
        before: 'Немає',
        after: 'Квартира біля метро',
      },
      {
        id: 'l1',
        at: '2026-11-05T16:20:00',
        actor: 'Адміністратор (демо)',
        action: 'Зміна ролі',
        before: 'Орендар',
        after: 'Власник',
      },
    ],
  },
  {
    id: 'u-owner-3',
    name: 'Власник 03 (демо)',
    email: 'owner3@example.com',
    phone: '+380 XX XXX XX XX',
    role: Role.Owner,
    identity: 'Verified',
    approvedRequest: null,
    log: [],
  },
  {
    id: 'u-manager',
    name: 'Менеджер (демо)',
    email: 'manager@example.com',
    phone: '+380 XX XXX XX XX',
    role: Role.Manager,
    identity: 'Verified',
    approvedRequest: null,
    log: [],
  },
  {
    id: 'u-admin',
    name: 'Адміністратор (демо)',
    email: 'admin@example.com',
    phone: '+380 XX XXX XX XX',
    role: Role.Admin,
    identity: 'Verified',
    approvedRequest: null,
    log: [],
  },
]

let objects: AdminObject[] = [
  {
    id: 'demo-1',
    title: 'Апартаменти на Подолі',
    district: 'Подільський',
    address: 'Демонстраційна вулиця, 1',
    ownerId: null,
  },
  {
    id: 'demo-2',
    title: 'Квартира біля метро',
    district: 'Шевченківський',
    address: 'Демонстраційна вулиця, 2',
    ownerId: 'u-owner',
  },
  {
    id: 'demo-3',
    title: 'Апартаменти на Печерську',
    district: 'Печерський',
    address: 'Демонстраційна вулиця, 3',
    ownerId: 'u-owner-3',
  },
]

const delay = () => new Promise((resolve) => setTimeout(resolve, 300))
const key = ['admin', 'users'] as const

function details(id: string): AdminUserDetails {
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('Not found')
  return { ...user, objects: objects.filter((o) => o.ownerId === id) }
}

function addLog(userId: string, actor: string, entry: Omit<AuditEntry, 'id' | 'at' | 'actor'>) {
  const record = { ...entry, id: crypto.randomUUID(), at: new Date().toISOString(), actor }
  users = users.map((u) => (u.id === userId ? { ...u, log: [record, ...u.log] } : u))
}

export function useAdminUsers() {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<AdminUserListItem[]> => {
      await delay()
      return users.map((u) => ({
        ...u,
        objectsCount: objects.filter((o) => o.ownerId === u.id).length,
      }))
    },
  })
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: [...key, id],
    queryFn: async () => {
      await delay()
      return details(id)
    },
    enabled: Boolean(id),
    retry: false,
  })
}

export function useAdminObjects() {
  return useQuery({
    queryKey: ['admin', 'objects'],
    queryFn: async () => {
      await delay()
      return [...objects]
    },
  })
}

export function ownerName(ownerId: string | null) {
  return users.find((u) => u.id === ownerId)?.name ?? null
}

type AdminAction =
  | { type: 'role'; role: Role }
  | { type: 'bind'; objectId: string }
  | { type: 'unbind'; objectId: string }

export function useAdminAction(userId: string, actor: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (action: AdminAction) => {
      await delay()
      const user = details(userId)

      if (action.type === 'role') {
        if (user.role === Role.Owner && action.role !== Role.Owner && user.objects.length > 0) {
          throw new Error('Owner still has objects')
        }
        users = users.map((u) => (u.id === userId ? { ...u, role: action.role } : u))
        addLog(userId, actor, {
          action: 'Зміна ролі',
          before: roleLabel[user.role],
          after: roleLabel[action.role],
        })
      }

      if (action.type === 'bind') {
        const object = objects.find((o) => o.id === action.objectId)
        if (!object) throw new Error('Object not found')
        const previous = object.ownerId
        objects = objects.map((o) => (o.id === object.id ? { ...o, ownerId: userId } : o))
        addLog(userId, actor, {
          action: previous ? 'Перепризначення об’єкта' : 'Прив’язка об’єкта',
          before: previous ? (ownerName(previous) ?? 'Інший власник') : 'Немає',
          after: object.title,
        })
        if (previous) {
          addLog(previous, actor, {
            action: 'Перепризначення об’єкта',
            before: object.title,
            after: user.name,
          })
        }
      }

      if (action.type === 'unbind') {
        const object = objects.find((o) => o.id === action.objectId)
        if (!object) throw new Error('Object not found')
        objects = objects.map((o) => (o.id === object.id ? { ...o, ownerId: null } : o))
        addLog(userId, actor, { action: 'Зняття прив’язки', before: object.title, after: 'Немає' })
      }

      return details(userId)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([...key, userId], updated)
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}
