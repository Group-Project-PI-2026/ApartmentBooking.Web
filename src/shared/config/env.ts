export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  oidcAuthority: import.meta.env.VITE_OIDC_AUTHORITY ?? '',
  oidcClientId: import.meta.env.VITE_OIDC_CLIENT_ID ?? '',
}
