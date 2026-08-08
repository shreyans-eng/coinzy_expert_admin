import type { User, UserRequestStats } from "@/types/admin-api";

export type UserSortKey =
  | "most_requests"
  | "most_active"
  | "most_credits"
  | "last_login_desc"
  | "last_login_asc"
  | "newest"
  | "name";

export type UserLastLoginFilter =
  | "all"
  | "never"
  | "last_7_days"
  | "last_30_days"
  | "older_30_days";

export type UserActivityFilter =
  | "all"
  | "has_requests"
  | "has_active"
  | "no_requests";

export type UserFilters = {
  search: string;
  lastLogin: UserLastLoginFilter;
  activity: UserActivityFilter;
};

export type UserFleetSummary = {
  totalUsers: number;
  totalRequests: number;
  totalActiveRequests: number;
  totalCompletedRequests: number;
  totalCreditsSpent: number;
  usersWithRequests: number;
  topRequester: { name: string; totalRequests: number } | null;
};

const EMPTY_STATS: UserRequestStats = {
  totalRequests: 0,
  activeRequests: 0,
  completedRequests: 0,
  deadlineMissedRequests: 0,
  refundedRequests: 0,
  adminCreatedRequests: 0,
  creditsSpentOnRequests: 0,
  lastRequestAt: null,
};

function compareLastLogin(
  a: string | null | undefined,
  b: string | null | undefined,
  direction: "asc" | "desc",
): number {
  const timeA = a ? new Date(a).getTime() : null;
  const timeB = b ? new Date(b).getTime() : null;

  if (timeA === null && timeB === null) return 0;
  if (timeA === null) return 1;
  if (timeB === null) return -1;

  return direction === "desc" ? timeB - timeA : timeA - timeB;
}

export function userStats(user: User): UserRequestStats {
  return user.stats ?? EMPTY_STATS;
}

function daysSince(value: string): number {
  const ms = Date.now() - new Date(value).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function matchesLastLoginFilter(
  lastLoginAt: string | null | undefined,
  filter: UserLastLoginFilter,
): boolean {
  switch (filter) {
    case "never":
      return !lastLoginAt;
    case "last_7_days":
      return !!lastLoginAt && daysSince(lastLoginAt) <= 7;
    case "last_30_days":
      return !!lastLoginAt && daysSince(lastLoginAt) <= 30;
    case "older_30_days":
      return !!lastLoginAt && daysSince(lastLoginAt) > 30;
    case "all":
    default:
      return true;
  }
}

function matchesActivityFilter(
  stats: UserRequestStats,
  filter: UserActivityFilter,
): boolean {
  switch (filter) {
    case "has_requests":
      return stats.totalRequests > 0;
    case "has_active":
      return stats.activeRequests > 0;
    case "no_requests":
      return stats.totalRequests === 0;
    case "all":
    default:
      return true;
  }
}

export function filterUsers(users: User[], filters: UserFilters): User[] {
  const query = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    if (!matchesLastLoginFilter(user.lastLoginAt, filters.lastLogin)) {
      return false;
    }

    const stats = userStats(user);
    if (!matchesActivityFilter(stats, filters.activity)) {
      return false;
    }

    if (query) {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export function summarizeUserFleet(users: User[]): UserFleetSummary {
  let totalRequests = 0;
  let totalActiveRequests = 0;
  let totalCompletedRequests = 0;
  let totalCreditsSpent = 0;
  let usersWithRequests = 0;
  let topRequester: UserFleetSummary["topRequester"] = null;

  for (const user of users) {
    const stats = userStats(user);
    totalRequests += stats.totalRequests;
    totalActiveRequests += stats.activeRequests;
    totalCompletedRequests += stats.completedRequests;
    totalCreditsSpent += stats.creditsSpentOnRequests;

    if (stats.totalRequests > 0) {
      usersWithRequests += 1;
    }

    if (
      !topRequester ||
      stats.totalRequests > topRequester.totalRequests
    ) {
      topRequester = {
        name: user.name,
        totalRequests: stats.totalRequests,
      };
    }
  }

  return {
    totalUsers: users.length,
    totalRequests,
    totalActiveRequests,
    totalCompletedRequests,
    totalCreditsSpent,
    usersWithRequests,
    topRequester:
      topRequester && topRequester.totalRequests > 0 ? topRequester : null,
  };
}

export function sortUsers(users: User[], sortKey: UserSortKey): User[] {
  const sorted = [...users];

  sorted.sort((a, b) => {
    const statsA = userStats(a);
    const statsB = userStats(b);

    switch (sortKey) {
      case "most_requests":
        return statsB.totalRequests - statsA.totalRequests;
      case "most_active":
        return statsB.activeRequests - statsA.activeRequests;
      case "most_credits":
        return b.creditBalance - a.creditBalance;
      case "last_login_desc":
        return compareLastLogin(a.lastLoginAt, b.lastLoginAt, "desc");
      case "last_login_asc":
        return compareLastLogin(a.lastLoginAt, b.lastLoginAt, "asc");
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  return sorted;
}

export function completionRateForUser(stats: UserRequestStats): number {
  const total = stats.completedRequests + stats.deadlineMissedRequests;
  if (total === 0) return 0;
  return Math.round((stats.completedRequests / total) * 100);
}

export function formatLastLogin(value: string | null | undefined): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}
