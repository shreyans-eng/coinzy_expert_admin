import {
  MAX_ACTIVE_REQUESTS,
  workloadBarColor,
} from "@/lib/expert-metrics";

export function ExpertWorkloadBar({
  count,
  showLabel = true,
}: {
  count: number;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.round((count / MAX_ACTIVE_REQUESTS) * 100));
  return (
    <div className="min-w-[88px]">
      {showLabel ? (
        <div className="mb-1 flex justify-between text-xs tabular-nums">
          <span className="font-medium text-text">{count}</span>
          <span className="text-text-muted">/{MAX_ACTIVE_REQUESTS}</span>
        </div>
      ) : null}
      <div className="h-1.5 overflow-hidden rounded-full bg-input-bg">
        <div
          className={`h-full rounded-full transition-all ${workloadBarColor(count)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
