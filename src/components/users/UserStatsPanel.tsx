import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { completionRateForUser } from "@/lib/user-metrics";
import type { UserRequestStats } from "@/types/admin-api";

type Props = {
  stats: UserRequestStats;
  creditBalance: number;
};

export function UserStatsPanel({ stats, creditBalance }: Props) {
  const completionRate = completionRateForUser(stats);

  return (
    <Card title="Request activity">
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total requests" value={stats.totalRequests} highlight />
        <StatTile label="Active now" value={stats.activeRequests} />
        <StatTile label="Completed" value={stats.completedRequests} />
        <StatTile label="Credits spent" value={stats.creditsSpentOnRequests} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <StatRow label="Deadline missed" value={stats.deadlineMissedRequests} />
        <StatRow label="Refund-related" value={stats.refundedRequests} />
        <StatRow label="Admin-created" value={stats.adminCreatedRequests} />
        <StatRow label="Current credits" value={creditBalance} />
        <StatRow
          label="Success rate"
          value={
            stats.completedRequests + stats.deadlineMissedRequests > 0
              ? `${completionRate}%`
              : "—"
          }
        />
        <StatRow
          label="Last request"
          value={
            stats.lastRequestAt
              ? new Date(stats.lastRequestAt).toLocaleString()
              : "—"
          }
        />
      </dl>
    </Card>
  );
}

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-input-bg/40 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-bold tabular-nums ${highlight ? "text-primary" : "text-text"}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2 text-sm">
      <dt className="text-text-muted">{label}</dt>
      <dd>
        {typeof value === "number" ? (
          <Badge variant="default">{value}</Badge>
        ) : (
          <span className="font-medium">{value}</span>
        )}
      </dd>
    </div>
  );
}
