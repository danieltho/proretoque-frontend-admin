# Production image for the admin frontend.
# Builds the Vite bundle, then serves the static `dist/` with nginx.

# --- Stage 1: build the Vite bundle ---
FROM node:20-alpine AS builder

# pnpm is pinned via `packageManager` in package.json; corepack honours it.
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

WORKDIR /app

# Cache the dependency layer: only re-runs if these two files change.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# VITE_API_BASE_URL is baked into the bundle at build time (import.meta.env).
# Relative `/api/v1` => the browser hits the same origin and nginx proxies
# /api/* to the backend, sidestepping CORS.
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_BASE_URL=http://localhost:8001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# tsc -b && vite build && copy-locales -> /app/dist
RUN pnpm build

# --- Stage 2: serve with nginx ---
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# The official nginx image runs envsubst over *.template files in
# /etc/nginx/templates and writes the result into /etc/nginx/conf.d/.
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
