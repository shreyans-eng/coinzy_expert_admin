# Cursor Prompt — Expired Request + Admin-Approved Refund Flow

Use this prompt to **design, document, or implement** the refund journey discussed with the team.
**Do not assume any refund API exists yet** — read current backend state first.

Backend repo: `coinzy-experts-backend`
Admin portal repo (planned): `coinzy-experts-admin`
Mobile app repo: `coinzy-experts-webapp`

---

## PROMPT (copy from here)

### Context — how refunds work **today** (no code changes assumed yet)

Read these files first:
- `coinzy-experts-backend/public/mobile-user/requests.md` (Refund Handling section)
- `coinzy-experts-backend/public/manual-smoke-flow.md` (step 16)
- `coinzy-experts-backend/controllers/admin/index.js`
- `coinzy-experts-backend/config/constants.js`

**Current reality:**

1. There is **no** mobile-user refund endpoint (`POST /users/requests/:id/refund` does **not** exist).
2. Refund-related request statuses exist in constants (`refund_pending`, `refund_processing`, `refunded`, `expired`) but **no handler transitions requests into these states yet**.
3. `RTN_EVENTS.REQUEST_REFUNDED` exists but nothing emits it in production flows yet.
4. `CREDIT_LEDGER_TYPES.REFUND` exists in the ledger model but refund approval does not write it automatically today.
5. When a user wants money back, the documented process is:
   - User contacts support **offline** (outside the app)
   - Admin reviews the case manually
   - Admin processes **Apple/Google store refund outside this app**
   - Admin restores in-app credits with **`POST /admin/users/:userId/credits/adjust`** (type: `admin_adjustment`, not `refund`)
6. Each request stores `creditLedgerId` linking the original `-1` spend (`request_created`) for future audit/refund work.

### Clarify “expired” before building UI

The word **expired** means different things today:

| Meaning | Where | Request status? | User can get refund today? |
|---------|-------|-----------------|---------------------------|
| Offer TTL passed | Expert offer `expiresAt` / accept blocked after `ttlExpiresAt` | Usually still `offered` → internal expert assigned at 48h | No in-app path |
| Request `expired` status | Constant only | **`expired` status is never set by current jobs** | No |
| Expert missed report deadline | Agenda `deadline-check` at `deadlineAt` | `deadline_missed` | Offline + admin credit adjust |
| User wants refund instead of retry | Product decision | User can **retry** via `POST /users/requests/:id/retry` while `deadline_missed` | Offline only today |

**Important:** TTL at 48h does **not** leave the request unassigned — internal expert is auto-assigned. So “expired without expert” is **not** the default path unless Agenda fails or internal expert is missing.

### Product requirement (as discussed)

Implement an **admin-approved refund** journey:

1. User identifies a request that failed / is no longer acceptable (e.g. `deadline_missed`, or future `expired` / cancelled cases).
2. User **requests a refund** in the mobile app (new flow — not built yet).
3. Request moves to **`refund_pending`** (awaiting admin review).
4. Admin reviews in the **admin portal** (new UI).
5. Admin **approves** or **rejects**:
   - **Approve:** restore 1 credit to user, mark request `refunded`, write ledger type `refund` linked to `requestId`, emit `request.refunded` RTN, optionally record store-refund-done flag.
   - **Reject:** return to prior terminal state or set `refund_rejected` with reason (product decision).
6. **Store money refund** (Apple/Google) remains **outside** the backend — admin confirms manually after processing with App Store / Play Console.

Credit restoration in Coinzy Experts is **separate** from store money refund:
- **Store refund** = real money via Apple/Google (manual, outside API)
- **Credit restore** = in-app evaluation credit (+1) via backend ledger

### What to design / implement (future phases)

#### Phase A — Backend (coinzy-experts-backend)

**Mobile user**
- `POST /users/requests/:id/refund-request` (name TBD)
  - Allowed statuses: define explicitly (minimum: `deadline_missed`; optionally future `expired`, `cancelled`)
  - Not allowed: `completed`, already `refunded`, `refund_pending`, active `accepted` with report in progress (product rule)
  - Body: optional `{ "reason": "..." }`
  - Sets `status = refund_pending`
  - Notify admins via RTN

**Admin**
- `GET /admin/requests?status=refund_pending` (currently 501 — implement)
- `GET /admin/requests/:id` (currently 501 — implement) — show user, creditLedgerId, timeline, status
- `POST /admin/requests/:id/refund/approve`
  - Validates `refund_pending`
  - Atomically: user `creditBalance += 1`, CreditLedger `{ type: refund, amount: +1, requestId, metadata: { approvedBy: admin } }`, request `status = refunded`
  - Emit `REQUEST_REFUNDED` to user
  - Idempotent: second approve returns 409
- `POST /admin/requests/:id/refund/reject`
  - Body: `{ "reason": "..." }`
  - Sets status back or to rejected-refund state

**Ledger rules**
- Use `CREDIT_LEDGER_TYPES.REFUND` (not `admin_adjustment`) when tied to a request refund
- Keep `creditLedgerId` on request pointing to original spend; refund entry is a **new** ledger row referencing same `requestId`

**Do NOT**
- Auto-refund on deadline without user action (unless product explicitly changes)
- Link Expert to User
- Process Apple/Google refunds inside Express API

#### Phase B — Admin portal (coinzy-experts-admin)

- **Refunds queue** page: list `refund_pending` requests
- Detail drawer: user info, request displayId, status history, original credit spend ledger id, user reason
- Actions: **Approve refund** / **Reject** with confirmation modal
- After approve: show updated credit balance + ledger entry
- Checklist reminder: “Process Apple/Google store refund separately”

#### Phase C — Mobile app (coinzy-experts-webapp)

- On request detail when `status === deadline_missed`:
  - Show **Retry** (existing API) AND **Request refund** (new)
- When `status === refund_pending`: show “Refund under review”
- When `status === refunded`: show “Refunded — credit restored” + listen for `request.refunded` RTN
- Do not expose admin API key on mobile

### How admin gives refund **today** (manual workaround)

Until Phase A/B ships, QA and ops use:

```http
POST /admin/users/:userId/credits/adjust
x-admin-key: <ADMIN_API_KEY>
Content-Type: application/json

{
  "amount": 1,
  "reason": "offline_refund_approved_for_request_<requestId>"
}
```

Then manually update request status in DB if needed (no official API).

Document in admin portal as **legacy manual flow**.

### Test scenarios to cover

1. `deadline_missed` → user requests refund → `refund_pending` → admin approve → balance +1, ledger `refund`, status `refunded`, RTN fired
2. Double approve → 409, balance unchanged second time
3. Approve while status `accepted` → 409
4. User retry vs refund mutual exclusion on `deadline_missed`
5. Request with `isAdminCreated: true` refund path
6. Original `creditLedgerId` preserved; refund ledger references same `requestId`

### Acceptance criteria

- [ ] User can see when a request is eligible for refund request
- [ ] Admin can see pending refund queue
- [ ] Admin approve restores exactly 1 credit with audit trail
- [ ] Store refund remains manual/out-of-band with clear ops docs
- [ ] No duplicate credit on retry + refund for same request
- [ ] Docs updated under `public/mobile-user/requests.md` and `public/admin/`

Start by producing a **sequence diagram** and **status machine** for request refund states, then implement backend before UI.

## PROMPT (copy to here)
