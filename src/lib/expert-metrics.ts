import type { Expert, ExpertStatus } from "@/types/admin-api";

/** Matches backend DEFAULT_WORKLOAD_LIMITS.MAX_ACTIVE_COMMITTED_REQUESTS */
export const MAX_ACTIVE_REQUESTS = 4;

export type ExpertFleetSummary = {
  total: number;
  active: number;
  suspended: number;
  blocked: number;
  available: number;
  internal: number;
  totalActiveRequests: number;
  totalCompleted: number;
  totalMissed: number;
};

export function summarizeExpertFleet(experts: Expert[]): ExpertFleetSummary {
  return experts.reduce(
    (acc, e) => {
      acc.total += 1;
      if (e.status === "active") acc.active += 1;
      if (e.status === "suspended") acc.suspended += 1;
      if (e.status === "blocked") acc.blocked += 1;
      if (e.isAvailableForRequests) acc.available += 1;
      if (e.isInternal) acc.internal += 1;
      acc.totalActiveRequests += e.activeCommittedRequestCount;
      acc.totalCompleted += e.stats.completedCount;
      acc.totalMissed += e.stats.missedDeadlineCount;
      return acc;
    },
    {
      total: 0,
      active: 0,
      suspended: 0,
      blocked: 0,
      available: 0,
      internal: 0,
      totalActiveRequests: 0,
      totalCompleted: 0,
      totalMissed: 0,
    },
  );
}

export function workloadPercent(expert: Expert): number {
  return Math.min(
    100,
    Math.round(
      (expert.activeCommittedRequestCount / MAX_ACTIVE_REQUESTS) * 100,
    ),
  );
}

export function completionRate(expert: Expert): number {
  const total = expert.stats.completedCount + expert.stats.missedDeadlineCount;
  if (total === 0) return 0;
  return Math.round((expert.stats.completedCount / total) * 100);
}

export function workloadTone(
  count: number,
): "low" | "medium" | "high" | "full" {
  if (count >= MAX_ACTIVE_REQUESTS) return "full";
  if (count >= 3) return "high";
  if (count >= 2) return "medium";
  return "low";
}

const TONE_COLORS = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-primary",
  full: "bg-danger",
} as const;

export function workloadBarColor(count: number): string {
  return TONE_COLORS[workloadTone(count)];
}

export type ExpertFilters = {
  search: string;
  status: ExpertStatus | "all";
  availability: "all" | "available" | "unavailable";
  type: "all" | "internal" | "external";
};

export function filterExperts(
  experts: Expert[],
  filters: ExpertFilters,
): Expert[] {
  const q = filters.search.trim().toLowerCase();
  return experts.filter((e) => {
    if (filters.status !== "all" && e.status !== filters.status) return false;
    if (filters.availability === "available" && !e.isAvailableForRequests)
      return false;
    if (filters.availability === "unavailable" && e.isAvailableForRequests)
      return false;
    if (filters.type === "internal" && !e.isInternal) return false;
    if (filters.type === "external" && e.isInternal) return false;
    if (q) {
      const hay = `${e.name} ${e.email}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function expertInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
