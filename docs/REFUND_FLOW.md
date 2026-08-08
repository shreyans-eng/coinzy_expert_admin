# Refund flow — design reference

Authoritative backend spec: [`coinzy-experts-backend/public/admin/refunds.md`](../../coinzy-experts-backend/public/admin/refunds.md)

Live API (today): [Admin Users docs](https://coinzy-experts-api.trackzio.com/docs/#/admin/users)

---

## Summary

**Two separate refunds:**

| Type | Who | How |
|------|-----|-----|
| Store money (Apple/Google) | Admin / ops | **Manual** — App Store Connect / Play Console |
| In-app evaluation credit (+1) | Backend | Ledger `refund` entry on admin approve (future) |

No mobile self-service refund exists today. Ops uses `POST /admin/users/:userId/credits/adjust` with reason noting the request ID.

---

## Status machine (target)

```
deadline_missed ──retry──► (re-allocate) offered/…
       │
       └──refund-request──► refund_pending ──approve──► refunded
                                    │
                                    └──reject──► deadline_missed
```

Retry and refund-request are **mutually exclusive** while on `deadline_missed`.

---

## Admin portal phases

| Phase | Page | Status |
|-------|------|--------|
| Now | `/refunds` | Legacy manual flow + coming-soon queue |
| Phase B | `/refunds` queue | Wire `GET /admin/requests?status=refund_pending` |
| Phase B | Refund detail | Approve / reject modals |

---

## Manual workaround (until Phase A)

```http
POST /admin/users/:userId/credits/adjust
x-admin-key: <key>
Content-Type: application/json

{
  "amount": 1,
  "reason": "offline_refund_approved_for_request_<requestId>"
}
```

Use **Users → Manage → Adjust credits** in this portal.
