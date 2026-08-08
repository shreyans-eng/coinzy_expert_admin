import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExpertWorkloadBar } from "@/components/experts/ExpertWorkloadBar";
import { MAX_ACTIVE_REQUESTS } from "@/lib/expert-metrics";
import type { Expert } from "@/types/admin-api";

export function ExpertActiveRequestsPanel({ expert }: { expert: Expert }) {
  const count = expert.activeCommittedRequestCount;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Active requests</h3>
          <p className="mt-1 text-xs text-text-muted">
            Committed evaluations in progress (max {MAX_ACTIVE_REQUESTS})
          </p>
        </div>
        <Badge variant={count >= MAX_ACTIVE_REQUESTS ? "danger" : "info"}>
          {count} active
        </Badge>
      </div>

      <div className="mt-4">
        <ExpertWorkloadBar count={count} />
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-warning/40 bg-warning-soft/50 p-4">
        <p className="text-sm font-medium text-warning-text">
          Request list coming soon
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Listing which user owns each active request requires{" "}
          <code className="rounded bg-surface px-1 font-mono">
            GET /admin/requests?assignedExpertId=
          </code>{" "}
          (currently 501 on the backend). Until then, use Allocation lookup with
          a known request ID.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          disabled
          title="Not implemented on API"
        >
          View assigned requests
        </Button>
      </div>
    </div>
  );
}
