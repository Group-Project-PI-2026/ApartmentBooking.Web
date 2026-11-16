# ApartmentBooking.Web

Frontend for the MyRent apartment booking service.

## Tech stack

- React 19, TypeScript, Vite
- React Router
- TanStack Query
- openapi-fetch with types generated from the backend OpenAPI spec
- Keycloak auth via oidc-client-ts and react-oidc-context
- CSS Modules with design tokens
- oxlint, Prettier

## Getting started

Requirements: Node.js 24, .NET SDK 10, Docker Desktop. The backend repository [ApartmentBooking](https://github.com/Group-Project-PI-2026/ApartmentBooking) must be cloned next to this one.

```bash
npm install
cp .env.example .env.local

docker compose -f dev/docker-compose.yml up -d
npm run backend
npm run dev
```

Run `npm run backend` and `npm run dev` in separate terminals. On macOS / Linux use `npm run backend:mac` instead of `npm run backend`.

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5278 |
| Keycloak | http://localhost:8081 |
| Postgres | localhost:5433        |

Test users (password `Test1234!`): `tenant@myrent.local`, `owner@myrent.local`, `manager@myrent.local`, `admin@myrent.local`. Keycloak admin: `admin` / `admin`.

Stripe and SMTP keys go to `dev/backend.env` (see `dev/backend.env.example`).

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start dev server                               |
| `npm run backend`   | Start backend with local dev settings          |
| `npm run build`     | Type check and production build                |
| `npm run lint`      | Lint                                           |
| `npm run format`    | Format code                                    |
| `npm run api:types` | Regenerate API types (backend must be running) |

## Docker

The image builds the app and serves it with Nginx. It proxies `/api/` to the backend and handles SPA routes. Runtime settings come from environment variables, so one image works on any server.

```bash
docker build -t myrent-web .
docker run -p 80:80 \
  -e API_UPSTREAM=http://backend:8080 \
  -e OIDC_AUTHORITY=https://auth.example.com/realms/apartment-booking \
  myrent-web
```

| Variable         | Default                 | Description                                      |
| ---------------- | ----------------------- | ------------------------------------------------ |
| `API_UPSTREAM`   | `http://backend:8080`   | Backend address for the `/api/` proxy            |
| `OIDC_AUTHORITY` | —                       | Keycloak realm URL                               |
| `OIDC_CLIENT_ID` | `apartment-booking-spa` | Keycloak client                                  |
| `API_BASE_URL`   | empty                   | API URL if it is not served from the same origin |

Health check: `GET /healthz`. The Keycloak client must allow the site URL in Valid redirect URIs and Web origins.
