export const Role = {
  Tenant: 'tenant',
  Owner: 'owner',
  Manager: 'manager',
  Admin: 'admin',
} as const

export type Role = (typeof Role)[keyof typeof Role]

interface JwtPayload {
  realm_access?: { roles?: string[] }
  resource_access?: Record<string, { roles?: string[] }>
}

const knownRoles = new Set<string>(Object.values(Role))

export function extractRoles(accessToken: string | undefined, clientId: string): Role[] {
  if (!accessToken) return []
  const payload = decodeJwtPayload(accessToken)
  if (!payload) return []

  const realmRoles = payload.realm_access?.roles ?? []
  const clientRoles = payload.resource_access?.[clientId]?.roles ?? []

  return [...new Set([...realmRoles, ...clientRoles])].filter((r): r is Role => knownRoles.has(r))
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload
  } catch {
    return null
  }
}
