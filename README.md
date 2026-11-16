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

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start dev server                               |
| `npm run backend`     | Start backend with local dev settings          |
| `npm run backend:mac` | Same on macOS / Linux                          |
| `npm run build`       | Type check and production build                |
| `npm run lint`        | Lint                                           |
| `npm run format`      | Format code                                    |
| `npm run api:types`   | Regenerate API types (backend must be running) |
