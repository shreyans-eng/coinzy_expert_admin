import { describe, expect, it } from "vitest";
import {
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
    name: "Bob",
    email: "bob@example.com",
    creditBalance: 2,
    lastLoginAt: "2026-08-01T00:00:00.000Z",
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

  it("sortUsers orders by last login descending", () => {
    const users: User[] = [
      {
        ...sampleUsers[0],
        lastLoginAt: "2026-01-01T00:00:00.000Z",
      },
      sampleUsers[1],
    ];
    const sorted = sortUsers(users, "last_login_desc");
    expect(sorted[0].name).toBe("Bob");
  });

  it("filterUsers matches last login and activity filters", () => {
    const users: User[] = [
      {
        ...sampleUsers[0],
        lastLoginAt: "2026-08-07T00:00:00.000Z",
      },
      {
        ...sampleUsers[1],
        lastLoginAt: null,
        stats: {
          ...sampleUsers[1].stats!,
          totalRequests: 0,
          activeRequests: 0,
        },
      },
    ];

    expect(
      filterUsers(users, {
        search: "",
        lastLogin: "last_7_days",
        activity: "all",
      }),
    ).toHaveLength(1);

    expect(
      filterUsers(users, {
        search: "",
        lastLogin: "never",
        activity: "all",
      }),
    ).toEqual([users[1]]);

    expect(
      filterUsers(users, {
        search: "",
        lastLogin: "all",
        activity: "has_active",
      }),
    ).toEqual([users[0]]);

    expect(
      filterUsers(users, {
        search: "bob",
        lastLogin: "all",
        activity: "all",
      }),
    ).toEqual([users[1]]);
  });
});
