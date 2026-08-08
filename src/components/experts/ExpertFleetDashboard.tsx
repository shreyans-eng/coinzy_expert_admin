import type { ExpertFleetSummary } from "@/lib/expert-metrics";

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
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ?? "text-text"}`}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-text-muted">{sub}</p> : null}
    </div>
  );
}

export function ExpertFleetDashboard({ summary }: { summary: ExpertFleetSummary }) {
  const completionTotal = summary.totalCompleted + summary.totalMissed;
  const fleetCompletionRate =
    completionTotal > 0
      ? Math.round((summary.totalCompleted / completionTotal) * 100)
      : 0;

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryTile label="Total experts" value={summary.total} />
        <SummaryTile
          label="Active accounts"
          value={summary.active}
          accent="text-success-text"
        />
        <SummaryTile
          label="Available now"
          value={summary.available}
          accent="text-info-text"
        />
        <SummaryTile
          label="Active requests"
          value={summary.totalActiveRequests}
          sub="Across all experts"
        />
        <SummaryTile
          label="Completed"
          value={summary.totalCompleted}
          accent="text-success-text"
        />
        <SummaryTile
          label="Missed deadlines"
          value={summary.totalMissed}
          accent="text-warning-text"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-text">Status breakdown</h3>
          <div className="mt-4 space-y-3">
            <StatusBar
              label="Active"
              count={summary.active}
              total={summary.total}
              color="bg-success"
            />
            <StatusBar
              label="Suspended"
              count={summary.suspended}
              total={summary.total}
              color="bg-warning"
            />
            <StatusBar
              label="Blocked"
              count={summary.blocked}
              total={summary.total}
              color="bg-danger"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-text">Fleet completion rate</h3>
          <div className="mt-4 flex items-center gap-6">
            <div
              className="relative h-24 w-24 shrink-0"
              role="img"
              aria-label={`${fleetCompletionRate}% completion rate`}
            >
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  className="stroke-input-border"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  className="stroke-success"
                  strokeWidth="3"
                  strokeDasharray={`${fleetCompletionRate} ${100 - fleetCompletionRate}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text">
                {fleetCompletionRate}%
              </span>
            </div>
            <div className="text-sm text-text-muted">
              <p>
                <span className="font-semibold text-success-text">
                  {summary.totalCompleted}
                </span>{" "}
                completed
              </p>
              <p className="mt-1">
                <span className="font-semibold text-warning-text">
                  {summary.totalMissed}
                </span>{" "}
                missed deadlines
              </p>
              <p className="mt-2 text-xs">
                {summary.internal} internal ·{" "}
                {summary.total - summary.internal} external
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium text-text">{label}</span>
        <span className="text-text-muted">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-input-bg">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
