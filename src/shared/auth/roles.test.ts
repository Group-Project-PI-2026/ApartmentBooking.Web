import { describe, expect, it } from 'vitest'
import { extractRoles } from './roles'

const base64url = (value: object) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const jwt = (payload: object) => `header.${base64url(payload)}.signature`

describe('extractRoles (Keycloak access token)', () => {
  it('returns [] for missing or malformed token', () => {
    expect(extractRoles(undefined, 'spa')).toEqual([])
    expect(extractRoles('not-a-jwt', 'spa')).toEqual([])
    expect(extractRoles('a.%%%.c', 'spa')).toEqual([])
  })

  it('merges realm and client roles, keeps only known roles, removes duplicates', () => {
    const token = jwt({
      realm_access: { roles: ['tenant', 'offline_access', 'uma_authorization'] },
      resource_access: { spa: { roles: ['manager', 'tenant'] }, other: { roles: ['admin'] } },
    })
    expect(extractRoles(token, 'spa').sort()).toEqual(['manager', 'tenant'])
  })

  it('decodes UTF-8 payload (Cyrillic name) correctly', () => {
    const token = jwt({ name: 'Юлія', realm_access: { roles: ['owner'] } })
    expect(extractRoles(token, 'spa')).toEqual(['owner'])
  })
})
