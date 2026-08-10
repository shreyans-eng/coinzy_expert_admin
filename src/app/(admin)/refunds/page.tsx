import { OfflineRefundForm } from "@/components/refunds/OfflineRefundForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";

export default function RefundsPage() {
  return (
    <>
      <PageHeader
        title="Refunds"
        description="Handle offline refunds manually until the Refund Queue APIs ship."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Refund queue">
          <div className="flex flex-col items-center py-8 text-center">
            <Badge variant="warning" className="mb-4">
              Phase B — coming soon
            </Badge>
            <p className="max-w-md text-sm text-text-muted">
              Approve / Reject is not implemented yet. Pending refunds will appear
              here once backend ships{" "}
              <code className="rounded bg-input-bg px-1.5 py-0.5 font-mono text-xs">
                GET /admin/requests?status=refund_pending
              </code>{" "}
              and the approve/reject endpoints.
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
          <p className="mb-4 text-sm text-text-muted">
            No automated refund API exists yet. Refund the store payment outside
            this app, then restore credits here via{" "}
            <code className="rounded bg-input-bg px-1 py-0.5 font-mono text-xs">
              POST /admin/users/:userId/credits/adjust
            </code>
            .
          </p>
          <OfflineRefundForm />
        </Card>
      </div>

      <Card title="Current limitations" className="mt-6">
        <ul className="space-y-2 text-sm text-text-muted">
          <li>✅ Restores the user&apos;s credits</li>
          <li>✅ Leaves an audit trail through the adjustment reason</li>
          <li>❌ Does not create a <code className="rounded bg-input-bg px-1 py-0.5 font-mono text-xs">refund</code> ledger entry</li>
          <li>
            ❌ Does not automatically change request status to{" "}
            <code className="rounded bg-input-bg px-1 py-0.5 font-mono text-xs">
              refunded
            </code>
          </li>
        </ul>
        <p className="mt-4 text-sm text-text-muted">
          Those last two items require the backend refund APIs and the planned
          Refund Queue / Approve / Reject flow.
        </p>
      </Card>

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
