# Coinzy Experts Admin Portal

Production admin panel for the Coinzy Experts platform. Consumes the existing Express backend via `x-admin-key` authentication.

## Quick start

```sh
cd coinzy-experts-admin
cp .env.sample .env.local
# Set NEXT_PUBLIC_API_BASE_URL=https://coinzy-experts-api.trackzio.com
npm install
npm run dev
npm test
```

Backend must be running (`coinzy-experts-backend`) with `ADMIN_API_KEY` matching the key entered in the admin UI.

```sh
cd ../coinzy-experts-backend
npm run dev
```

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — design tokens aligned with `coinzy-experts-webapp`
- **Vitest** + **@testing-library/react** for unit/integration tests

## Features

| Section | Status |
|---------|--------|
| Experts — list, create, edit, status | ✅ |
| Users — search, credit adjust, create request | ✅ |
| Allocation summary audit | ✅ |
| Requests list/detail/assign | 🔜 Coming soon (501) |
| Expert country bulk assign | 🔜 Coming soon (501) |

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL (default `https://coinzy-experts-api.trackzio.com`) |
| `ADMIN_API_KEY` | Optional local dev reference only — not bundled |

Admin API key is entered in the login UI and stored in `sessionStorage`.

**Deploy to Vercel:** see **[DEPLOY.md](./DEPLOY.md)** for full step-by-step instructions (CLI + GitHub, live prod URL).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run predeploy` | Lint + test + build (run before Vercel deploy) |

## Deploy to Vercel (summary)

Live API: `https://coinzy-experts-api.trackzio.com`

```sh
npm run predeploy
npx vercel@latest login
npx vercel@latest --prod
```

Set `NEXT_PUBLIC_API_BASE_URL=https://coinzy-experts-api.trackzio.com` in Vercel env vars.

**Full guide:** [DEPLOY.md](./DEPLOY.md)
