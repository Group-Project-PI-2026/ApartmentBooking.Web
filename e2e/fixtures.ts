import { test as base, type Page, type Route } from '@playwright/test'

export const AUTHORITY = 'http://localhost:8081/realms/apartment-booking'

export const districts = [
  { id: 6, name: 'Печерський' },
  { id: 7, name: 'Подільський' },
  { id: 10, name: 'Шевченківський' },
]

export const apartments = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    photoUrl: null,
    title: 'Студія біля Печерської лаври',
    districtId: 6,
    districtName: 'Печерський',
    pricePerNight: 1800,
    totalPrice: null,
    maxGuests: 2,
    amenities: ['Wi-Fi', 'Кухня'],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    photoUrl: null,
    title: 'Двокімнатна на Хрещатику',
    districtId: 10,
    districtName: 'Шевченківський',
    pricePerNight: 3200,
    totalPrice: null,
    maxGuests: 4,
    amenities: ['Wi-Fi', 'Пральна машина'],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    photoUrl: null,
    title: 'Квартира на Подолі',
    districtId: 7,
    districtName: 'Подільський',
    pricePerNight: 1500,
    totalPrice: null,
    maxGuests: 3,
    amenities: ['Кухня'],
  },
]

export const details = (id: string) => {
  const a = apartments.find((x) => x.id === id)!
  return {
    id: a.id,
    title: a.title,
    description: 'Затишне помешкання для тестів.',
    address: 'вул. Лаврська, 10',
    districtId: a.districtId,
    districtName: a.districtName,
    maxGuests: a.maxGuests,
    pricePerNight: a.pricePerNight,
    photoUrls: [],
    amenities: a.amenities,
  }
}

export interface MockApi {
  /** Every /api request seen by the mock (method + path + query). */
  requests: string[]
  /** Overrides the list returned by GET /api/apartments (search). */
  searchResult: (url: URL) => unknown[] | { status: number }
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

async function mockBackend(page: Page, api: MockApi) {
  // Only backend calls (/api/...), not Vite source modules such as /src/features/booking/api/*.ts
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const url = new URL(route.request().url())
      api.requests.push(`${route.request().method()} ${url.pathname}${url.search}`)

      if (url.pathname === '/api/apartments/districts') return json(route, districts)
      if (url.pathname === '/api/apartments') {
        const result = api.searchResult(url)
        return Array.isArray(result)
          ? json(route, result)
          : json(route, { title: 'Internal server error', status: result.status }, result.status)
      }
      const match = url.pathname.match(/^\/api\/apartments\/([0-9a-f-]{36})$/)
      if (match) {
        return apartments.some((a) => a.id === match[1])
          ? json(route, details(match[1]))
          : json(route, { title: 'Not found', status: 404 }, 404)
      }
      return json(route, { title: 'Unauthorized', status: 401 }, 401)
    },
  )

  // Keycloak: discovery document + a fake login page.
  await page.route(`${AUTHORITY}/.well-known/openid-configuration`, (route) =>
    json(route, {
      issuer: AUTHORITY,
      authorization_endpoint: `${AUTHORITY}/protocol/openid-connect/auth`,
      token_endpoint: `${AUTHORITY}/protocol/openid-connect/token`,
      end_session_endpoint: `${AUTHORITY}/protocol/openid-connect/logout`,
      jwks_uri: `${AUTHORITY}/protocol/openid-connect/certs`,
    }),
  )
  await page.route(`${AUTHORITY}/protocol/openid-connect/auth**`, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Keycloak login (mock)</h1>' }),
  )
}

export const test = base.extend<{ api: MockApi }>({
  api: [
    async ({ page }, use) => {
      const api: MockApi = {
        requests: [],
        searchResult: (url) => {
          const districtId = url.searchParams.get('districtId')
          const guests = Number(url.searchParams.get('guestsCount') ?? 0)
          return apartments
            .filter((a) => !districtId || String(a.districtId) === districtId)
            .filter((a) => a.maxGuests >= guests)
        },
      }
      await mockBackend(page, api)
      await use(api)
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'

export function isoInDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
