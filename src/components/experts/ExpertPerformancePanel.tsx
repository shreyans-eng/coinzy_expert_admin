import type { Expert } from "@/types/admin-api";
import {
  MAX_ACTIVE_REQUESTS,
  completionRate,
  workloadPercent,
} from "@/lib/expert-metrics";

export function ExpertPerformancePanel({ expert }: { expert: Expert }) {
  const rate = completionRate(expert);
  const completed = expert.stats.completedCount;
  const missed = expert.stats.missedDeadlineCount;
  const totalOutcomes = completed + missed;
  const workload = expert.activeCommittedRequestCount;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-text">Workload capacity</h3>
        <p className="mt-1 text-xs text-text-muted">
          Active committed requests vs max ({MAX_ACTIVE_REQUESTS})
        </p>
        <div className="mt-5 flex items-center gap-5">
          <div
            className="relative h-28 w-28 shrink-0"
            role="img"
            aria-label={`${workload} of ${MAX_ACTIVE_REQUESTS} active requests`}
          >
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                className="stroke-input-border"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                className={
                  workload >= MAX_ACTIVE_REQUESTS
                    ? "stroke-danger"
                    : workload >= 3
                      ? "stroke-primary"
                      : workload >= 2
                        ? "stroke-warning"
                        : "stroke-success"
                }
                strokeWidth="2.5"
                strokeDasharray={`${workloadPercent(expert)} ${100 - workloadPercent(expert)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-text">{workload}</span>
              <span className="text-[10px] text-text-muted">active</span>
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              Available:{" "}
              <strong>
                {expert.isAvailableForRequests ? "Yes" : "No"}
              </strong>
            </li>
            <li className="text-text-muted">
              Slots free:{" "}
              <strong className="text-text">
                {Math.max(0, MAX_ACTIVE_REQUESTS - workload)}
              </strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-text">Completion outcomes</h3>
        <p className="mt-1 text-xs text-text-muted">
          Completed vs missed deadline (all time)
        </p>
        {totalOutcomes === 0 ? (
          <p className="mt-8 text-center text-sm text-text-muted">
            No completed outcomes yet
          </p>
        ) : (
          <>
            <div className="mt-5 flex h-8 overflow-hidden rounded-lg">
              <div
                className="flex items-center justify-center bg-success text-[10px] font-semibold text-white"
                style={{
                  width: `${(completed / totalOutcomes) * 100}%`,
                }}
              >
                {completed > 0 ? completed : ""}
              </div>
              <div
                className="flex items-center justify-center bg-warning text-[10px] font-semibold text-white"
                style={{
                  width: `${(missed / totalOutcomes) * 100}%`,
                }}
              >
                {missed > 0 ? missed : ""}
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-success-text">
                ✓ {completed} completed ({rate}%)
              </span>
              <span className="text-warning-text">✗ {missed} missed</span>
            </div>
            {expert.stats.avgCompletionHoursLast5 != null ? (
              <p className="mt-4 rounded-lg bg-input-bg px-3 py-2 text-sm">
                Avg completion (last 5):{" "}
                <strong>
                  {expert.stats.avgCompletionHoursLast5.toFixed(1)}h
                </strong>
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
