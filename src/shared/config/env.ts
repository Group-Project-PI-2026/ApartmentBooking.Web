const runtime = window.__APP_CONFIG__ ?? {}

const pick = (runtimeValue: string | undefined, buildValue: string | undefined) =>
  runtimeValue || buildValue || ''

export const env = {
  apiBaseUrl: pick(runtime.apiBaseUrl, import.meta.env.VITE_API_BASE_URL),
  oidcAuthority: pick(runtime.oidcAuthority, import.meta.env.VITE_OIDC_AUTHORITY),
  oidcClientId: pick(runtime.oidcClientId, import.meta.env.VITE_OIDC_CLIENT_ID),
}
