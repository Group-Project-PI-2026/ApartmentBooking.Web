import { defineConfig, devices } from '@playwright/test'

const PORT = 5174
const AUTHORITY = 'http://localhost:8081/realms/apartment-booking'

/**
 * Frontend E2E tests. The real SPA runs in Vite; the backend API and Keycloak are mocked
 * with page.route() (see e2e/fixtures.ts), so the suite is deterministic and needs no Docker.
 * Uses the locally installed Google Chrome (channel: 'chrome').
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test-results/playwright-report' }]],
  outputDir: 'test-results/playwright-artifacts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    locale: 'uk-UA',
    timezoneId: 'Europe/Kyiv',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_OIDC_AUTHORITY: AUTHORITY,
      VITE_OIDC_CLIENT_ID: 'apartment-booking-spa',
      VITE_API_BASE_URL: '',
    },
  },
})
