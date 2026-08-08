import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import Link from "next/link";

export default function RefundsPage() {
  return (
    <>
      <PageHeader
        title="Refunds"
        description="Admin-approved refund queue and legacy manual credit restoration."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Refund queue">
          <div className="flex flex-col items-center py-8 text-center">
            <Badge variant="warning" className="mb-4">
              Phase B — coming soon
            </Badge>
            <p className="max-w-md text-sm text-text-muted">
              Pending refunds will appear here once backend ships{" "}
              <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
                GET /admin/requests?status=refund_pending
              </code>{" "}
              and approve/reject endpoints.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button disabled title="501 — not implemented">
                Approve refund
              </Button>
              <Button variant="secondary" disabled title="501 — not implemented">
                Reject refund
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Legacy manual flow (use today)">
          <p className="text-sm text-text-muted">
            No automated refund API exists yet. When a user requests a refund
            offline:
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-text">
            <li>Review the case (request MongoDB <code className="font-mono text-xs">_id</code>, not display ID).</li>
            <li>
              Process the <strong>Apple/Google store refund</strong> outside this
              app (App Store Connect / Play Console).
            </li>
            <li>
              Restore the in-app credit via{" "}
              <Link href="/users" className="font-medium text-primary hover:underline">
                Users → Adjust credits
              </Link>
              :
            </li>
          </ol>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-input-bg p-4 text-xs leading-relaxed">
{`POST /admin/users/:userId/credits/adjust
x-admin-key: <ADMIN_API_KEY>

{
  "amount": 1,
  "reason": "offline_refund_approved_for_request_<requestId>"
}`}
          </pre>
          <p className="mt-4 text-xs text-text-muted">
            This writes ledger type{" "}
            <code className="rounded bg-input-bg px-1 py-0.5">admin_adjustment</code>,
            not{" "}
            <code className="rounded bg-input-bg px-1 py-0.5">refund</code>.
            Request status is not updated automatically.
          </p>
        </Card>
      </div>

      <Card title="Target flow (Phase A–C)" className="mt-6">
        <div className="space-y-4 text-sm text-text-muted">
          <p>
            <strong className="text-text">1.</strong> User on{" "}
            <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
              deadline_missed
            </code>{" "}
            taps <em>Request refund</em> →{" "}
            <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
              refund_pending
            </code>
          </p>
          <p>
            <strong className="text-text">2.</strong> Admin approves → +1 credit,
            ledger type{" "}
            <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
              refund
            </code>
            , status{" "}
            <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
              refunded
            </code>
            , RTN{" "}
            <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
              request.refunded
            </code>
          </p>
          <p>
            <strong className="text-text">3.</strong> Store money refund remains
            manual — credit restore and store refund are separate steps.
          </p>
          <p>
            Full spec:{" "}
            <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
              coinzy-experts-backend/public/admin/refunds.md
            </code>
          </p>
        </div>
      </Card>
    </>
  );
}
