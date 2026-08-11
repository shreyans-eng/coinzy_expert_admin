import type { User, UserRequestStats } from "@/types/admin-api";

export type UserSortKey =
  | "most_requests"
  | "most_active"
  | "most_credits"
  | "newest";

export type UserFilters = {
  search: string;
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
  withResult: 0,
  withoutResult: 0,
};

export function userStats(user: User): UserRequestStats {
  return user.stats ?? EMPTY_STATS;
}

export function displayUserLabel(user: Pick<User, "name" | "email" | "externalUserId">): string {
  return user.name?.trim() || user.email?.trim() || user.externalUserId || "Unknown user";
}

export function filterUsers(users: User[], filters: UserFilters): User[] {
  const query = filters.search.trim().toLowerCase();
  if (!query) return users;

  return users.filter((user) => (user.email ?? "").toLowerCase().includes(query));
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
        name: displayUserLabel(user),
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
