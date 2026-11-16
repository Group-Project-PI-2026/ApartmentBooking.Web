FROM node:24.11-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.28-alpine
ENV API_UPSTREAM=http://backend:8080 \
    API_BASE_URL= \
    OIDC_AUTHORITY= \
    OIDC_CLIENT_ID=apartment-booking-spa \
    NGINX_ENVSUBST_FILTER=^API_UPSTREAM$
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/write-config.sh /docker-entrypoint.d/40-write-config.sh
RUN chmod +x /docker-entrypoint.d/40-write-config.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
