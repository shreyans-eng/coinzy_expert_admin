import { describe, expect, it } from "vitest";
import {
  displayUserLabel,
  filterUsers,
  sortUsers,
  summarizeUserFleet,
  userStats,
} from "@/lib/user-metrics";
import type { User } from "@/types/admin-api";

const sampleUsers: User[] = [
  {
    _id: "1",
    externalUserId: "ext-1",
    name: "Alice",
    email: "alice@example.com",
    creditBalance: 5,
    lastLoginAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    stats: {
      totalRequests: 10,
      activeRequests: 2,
      completedRequests: 7,
      deadlineMissedRequests: 1,
      refundedRequests: 0,
      adminCreatedRequests: 1,
      creditsSpentOnRequests: 10,
      lastRequestAt: "2026-08-01T00:00:00.000Z",
    },
  },
  {
    _id: "2",
    externalUserId: "ext-2",
    name: null,
    email: "bob@example.com",
    creditBalance: 2,
    lastLoginAt: null,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
    stats: {
      totalRequests: 3,
      activeRequests: 1,
      completedRequests: 2,
      deadlineMissedRequests: 0,
      refundedRequests: 0,
      adminCreatedRequests: 0,
      creditsSpentOnRequests: 3,
      lastRequestAt: "2026-07-01T00:00:00.000Z",
    },
  },
];

describe("user-metrics", () => {
  it("summarizeUserFleet finds top requester", () => {
    const summary = summarizeUserFleet(sampleUsers);
    expect(summary.totalRequests).toBe(13);
    expect(summary.topRequester?.name).toBe("Alice");
    expect(summary.topRequester?.totalRequests).toBe(10);
  });

  it("sortUsers orders by most requests", () => {
    const sorted = sortUsers(sampleUsers, "most_requests");
    expect(sorted[0].name).toBe("Alice");
    expect(userStats(sorted[1]).totalRequests).toBe(3);
  });

  it("sortUsers orders by newest joined", () => {
    const sorted = sortUsers(sampleUsers, "newest");
    expect(sorted[0].email).toBe("bob@example.com");
  });

  it("displayUserLabel falls back to email when name is missing", () => {
    expect(displayUserLabel(sampleUsers[1])).toBe("bob@example.com");
  });

  it("filterUsers matches email search", () => {
    expect(filterUsers(sampleUsers, { search: "bob" })).toEqual([
      sampleUsers[1],
    ]);
    expect(filterUsers(sampleUsers, { search: "" })).toEqual(sampleUsers);
  });
});
