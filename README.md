# ChiefVoice CRM — Frontend

Vite + React + TypeScript dashboard for ChiefVoice CRM. This is a standalone
project — it talks to `chiefvoice-crm-backend` over HTTP (CORS-enabled), with
no shared files or build step between the two.

## Local development

```
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` to the backend on
`http://localhost:3000` (see `vite.config.js`). Start the backend separately
in its own repo/terminal.

## Build

```
npm run build
```

Outputs a static build to `dist/`, deployable to any static host (Vercel,
Netlify, Cloudflare Pages, etc.) pointed at the backend's API URL.

## Routes

- `/` — customer dashboard
- `/admin` — platform admin panel (requires an account allowlisted via the
  backend's `PLATFORM_ADMIN_EMAILS`)

## Production on Vercel

This frontend is deployed separately from the backend. Set the Vercel project's Root Directory to `crm-frontend-dev` and configure the Production environment variables from `.env.production.example`:

- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`
- `VITE_API_URL`
- `VITE_APP_ENV`

Never put backend secrets in Vercel. All `VITE_*` values are public browser configuration.
