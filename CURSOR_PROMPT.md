# Cursor Prompt — Coinzy Experts Admin Portal

Copy everything inside the fenced block below and paste it as a **new Cursor Agent chat** in the parent workspace folder `shreyans-jain/`.

---

## PROMPT (copy from here)

Build a production-quality **Coinzy Experts Admin Portal** as a new web app.

### Location & naming

- Create folder: `/Users/macbookair/shreyans-jain/coinzy-experts-admin`
- Package name: `coinzy-experts-admin`
- This is the **SLC admin panel** for the existing backend at `/Users/macbookair/shreyans-jain/coinzy-experts-backend`

### Tech stack (required)

**Important:** Next.js does **not** use Vite as its bundler (it uses Turbopack/Webpack). To honor both requirements:

- Use **Next.js 16** (App Router) + **React 19** + **TypeScript** — match sibling app `coinzy-experts-webapp`
- Use **Vitest** + **@testing-library/react** for unit/integration tests (Vitest is the test runner; Next remains the app bundler)
- Use **Tailwind CSS v4** — match `coinzy-experts-webapp` styling conventions
- Node >= 20, ESM where applicable
- Do **not** add a separate backend; consume the existing Express API only

If you strongly prefer Vite as the **app** bundler instead of Next.js, use **React + Vite + React Router** instead — but default to **Next.js** for consistency with `coinzy-experts-webapp` and `banknote-experts-web`.

### Backend integration

- Base URL from env: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`)
- Admin auth: send **`x-admin-key`** header (also accept storing value typed in login/settings UI)
- Env file: `.env.local` with `NEXT_PUBLIC_API_BASE_URL` and optionally `ADMIN_API_KEY` for local dev
- All responses use this envelope:

```json
{ "error": false, "message": null, "data": { } }
{ "error": true, "message": "Human readable error", "data": { } }
```

- Never expose or log the admin API key in client bundles beyond what the admin operator enters in session/local storage

### Implemented admin API surface (wire ALL of these)

Read authoritative docs from backend:
- `coinzy-experts-backend/public/admin/experts.md`
- `coinzy-experts-backend/public/admin/users.md`
- `coinzy-experts-backend/controllers/admin/index.js`

#### Experts — fully implemented

| Method | Path | UI page / action |
|--------|------|------------------|
| `POST` | `/admin/experts` | Create expert form |
| `GET` | `/admin/experts` | Experts list table |
| `GET` | `/admin/experts/:id` | Expert detail drawer/page |
| `PATCH` | `/admin/experts/:id` | Edit expert (name, email, password, countries, profile) |
| `PATCH` | `/admin/experts/:id/status` | Suspend / activate / block |

**Create expert body:**
```json
{
  "name": "Expert One",
  "email": "expert@example.com",
  "password": "secret",
  "supportedCountries": ["IN"],
  "profilePicture": "https://...",
  "oneLineDescription": "Optional bio"
}
```

**Update status body:** `{ "status": "active" | "suspended" | "blocked" }`

**Notes for UI:**
- `supportedCountries: []` means **all countries**
- Internal experts cannot be created via API; show badge if `isInternal: true`
- Show stats: `activeCommittedRequestCount`, `stats.completedCount`, `stats.missedDeadlineCount`, `stats.avgCompletionHoursLast5`, `lastOfferedAt`, `lastAssignedAt`

#### Users — fully implemented

| Method | Path | UI page / action |
|--------|------|------------------|
| `GET` | `/admin/users?email=` | Users list with email search |
| `POST` | `/admin/users/:userId/credits/adjust` | Credit adjust modal |
| `POST` | `/admin/users/:userId/requests` | Create request on behalf of user |

**Credit adjust body:** `{ "amount": 1, "reason": "manual_grant" }` — integer, non-zero, balance cannot go negative

**Create request for user body:**
```json
{
  "country": "IN",
  "payload": {
    "media": {
      "obverse": ["https://media.example.com/..."],
      "reverse": ["https://..."],
      "edge": ["https://..."],
      "video": null
    }
  }
}
```
- Consumes 1 credit; response includes full admin request object + updated user
- Tag `isAdminCreated: true` in response

#### Requests / allocation — partial

| Method | Path | Status | UI behavior |
|--------|------|--------|-------------|
| `GET` | `/admin/requests/:id/allocation-summary` | ✅ Implemented | Allocation audit viewer |
| `GET` | `/admin/requests` | 501 | Show "Coming soon" stub |
| `GET` | `/admin/requests/:id` | 501 | Show "Coming soon" stub |
| `POST` | `/admin/requests/:id/assign` | 501 | Disabled button + tooltip |
| `POST` | `/admin/requests/:id/mark-payment-released` | 501 | Disabled button + tooltip |
| `PATCH` | `/admin/experts/:id/countries` | 501 | Disabled / coming soon |

**Allocation summary:**
- Optional query: `?stage=initial|first_window_expired|skip_refill`
- Without stage: `data.stages` grouped by stage
- With stage: `data.attempts[]` each with `attemptId`, `round`, `attemptedAt`, `summary[]` (expertId, workloadPenalty, speedPenalty, score, rank, offered)
- UI: enter Request MongoDB `_id` (not displayId `EV-...`) to load summary; show ranked tables per attempt

### App structure (suggested)

```
coinzy-experts-admin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard redirect
│   │   ├── login/page.tsx      # Admin API key entry
│   │   ├── experts/
│   │   │   ├── page.tsx        # List
│   │   │   ├── new/page.tsx    # Create
│   │   │   └── [id]/page.tsx   # Detail + edit + status
│   │   ├── users/
│   │   │   ├── page.tsx        # List + search
│   │   │   └── [id]/page.tsx   # Credits + create request
│   │   └── allocation/
│   │       └── page.tsx        # Request ID lookup → summary
│   ├── lib/
│   │   ├── api-client.ts       # fetch wrapper + x-admin-key
│   │   ├── admin-api.ts        # typed functions per endpoint
│   │   └── auth.ts             # sessionStorage for admin key
│   ├── components/
│   │   ├── layout/AdminShell.tsx
│   │   ├── experts/...
│   │   ├── users/...
│   │   └── ui/...              # tables, forms, toasts, badges
│   └── types/
│       └── admin-api.ts        # Request/response TypeScript types
├── tests/
│   ├── api-client.test.ts
│   ├── admin-api.test.ts
│   └── components/...
├── .env.sample
├── vitest.config.ts
├── package.json
└── README.md
```

### UX requirements

1. **Login gate:** Admin enters API key once; persist in `sessionStorage`; attach to every API call
2. **Global error handling:** Show API `message` on `error: true`; handle 401/403 → back to login
3. **Loading & empty states** on all lists
4. **Confirm dialogs** for status changes and credit adjustments
5. **Form validation** client-side mirroring backend rules (country required, integer credits, etc.)
6. **Responsive** admin layout: sidebar nav (Experts, Users, Allocation, Settings)
7. **501 endpoints:** visible in nav as disabled/coming-soon — do not hide them

### API client pattern

```typescript
// lib/api-client.ts
export async function adminFetch<T>(
  path: string,
  options: RequestInit & { adminKey: string }
): Promise<{ error: boolean; message: string | null; data: T }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": options.adminKey,
      ...options.headers,
    },
  });
  return res.json();
}
```

### Vitest testing (required)

- Mock `fetch` in API layer tests
- Test: successful list experts, 401 invalid key, credit adjust validation errors, allocation summary stage filter
- Component tests: login form, experts table renders rows, credit adjust modal
- Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`

### README must include

```sh
cd coinzy-experts-admin
cp .env.sample .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
npm install
npm run dev
npm test
```

Backend must be running (`coinzy-experts-backend`) with `ADMIN_API_KEY` matching the key entered in the admin UI.

### Guardrails

- Do not link Expert to User (backend rule — admin panel must not assume shared accounts)
- Do not implement JWT admin auth — only `x-admin-key`
- Do not call mobile-user or expert routes from this admin app except where admin API delegates (create user request)
- Match API field names exactly; do not rename backend fields in types
- Keep components practical; no over-abstracted service layer

### Deliverables checklist

- [ ] Scaffold Next.js app in `coinzy-experts-admin`
- [ ] Typed API client for all implemented admin endpoints
- [ ] Pages: Login, Experts (CRUD + status), Users (list/search/credits/create request), Allocation summary
- [ ] Stubs for 501 endpoints
- [ ] Vitest tests for API client + key components
- [ ] `.env.sample` + README
- [ ] Run `npm test` and `npm run lint` before finishing

Start by reading `coinzy-experts-backend/public/admin/*.md` and `controllers/admin/index.js`, then scaffold the app.

## PROMPT (copy to here)

---

## Quick start command (after Cursor builds the app)

```sh
cd /Users/macbookair/shreyans-jain/coinzy-experts-admin
cp .env.sample .env.local
npm install
npm run dev
```

Backend (separate terminal):

```sh
cd /Users/macbookair/shreyans-jain/coinzy-experts-backend
npm run dev
```
