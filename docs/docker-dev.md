# Docker dev environment

Run the admin frontend without installing Node or pnpm on the host.

## Quick start

```bash
docker compose up --build      # First time — builds the image
docker compose up              # Subsequent runs
```

App at `http://localhost:5173` (Vite dev server with HMR).

## Pointing at a different backend

The Vite dev server proxies `/api/*` → `$BACKEND_URL`. The default is
`http://host.docker.internal:8000` (the local backend in `dev-backend/`).
Override per-invocation from the host shell:

```bash
BACKEND_URL=https://staging.api.example.com docker compose up
```

Because requests are same-origin from the browser's perspective, no CORS
config is needed on the backend.

## HMR / file watching

The repo is bind-mounted into the container, so edits propagate to Vite's
file watcher. If changes aren't picked up on slow filesystems (Windows
WSL1, network mounts), uncomment this line in `docker-compose.yml`:

```yaml
# CHOKIDAR_USEPOLLING: "true"
```

## Linux notes

`host.docker.internal` is resolved natively by Docker Desktop on macOS and
Windows; on Linux the compose file declares `extra_hosts: host-gateway` to
make it work. If your backend lives on a different machine, set
`BACKEND_URL` to its reachable URL.

## What's not here

- **Production image** — this setup is dev-only (Vite dev server). For
  prod you'd want a multi-stage build that runs `pnpm build` and serves
  `dist/` with nginx or similar.
- **The backend itself** — it lives in its own repo with its own compose.
