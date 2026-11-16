#!/bin/sh
set -eu

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

API_BASE_URL_JSON=$(json_escape "${API_BASE_URL:-}")
OIDC_AUTHORITY_JSON=$(json_escape "${OIDC_AUTHORITY:-}")
OIDC_CLIENT_ID_JSON=$(json_escape "${OIDC_CLIENT_ID:-apartment-booking-spa}")

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = {
  apiBaseUrl: "${API_BASE_URL_JSON}",
  oidcAuthority: "${OIDC_AUTHORITY_JSON}",
  oidcClientId: "${OIDC_CLIENT_ID_JSON}"
}
EOF
