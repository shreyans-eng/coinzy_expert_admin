import type { UserFleetSummary } from "@/lib/user-metrics";

function SummaryTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${accent ?? "text-text"}`}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-text-muted">{sub}</p> : null}
    </div>
  );
}

export function UserFleetDashboard({ summary }: { summary: UserFleetSummary }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryTile label="Total users" value={summary.totalUsers} />
      <SummaryTile
        label="Total requests"
        value={summary.totalRequests}
        accent="text-primary"
      />
      <SummaryTile
        label="Active requests"
        value={summary.totalActiveRequests}
        accent="text-info-text"
      />
      <SummaryTile
        label="Completed"
        value={summary.totalCompletedRequests}
        accent="text-success-text"
      />
      <SummaryTile
        label="Credits spent"
        value={summary.totalCreditsSpent}
        sub="On evaluation requests"
      />
      <SummaryTile
        label="Top requester"
        value={summary.topRequester?.totalRequests ?? 0}
        sub={summary.topRequester?.name ?? "No requests yet"}
        accent="text-primary"
      />
    </div>
  );
}
