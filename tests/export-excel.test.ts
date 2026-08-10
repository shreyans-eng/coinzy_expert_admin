import { describe, expect, it } from "vitest";
import {
  expertToExportRow,
  userToExportRow,
} from "@/lib/export-excel";
import type { Expert, User } from "@/types/admin-api";

const sampleExpert: Expert = {
  _id: "exp-1",
  name: "Jordan Lee",
  email: "jordan@example.com",
  profilePicture: null,
  oneLineDescription: null,
  yearsOfXp: "12 years",
  expertise: "Ancient coins",
  isInternal: true,
  isAvailableForRequests: false,
  supportedCountries: ["US", "CA"],
  status: "active",
  activeCommittedRequestCount: 2,
  stats: {
    completedCount: 8,
    missedDeadlineCount: 2,
    avgCompletionHoursLast5: 4.5,
  },
  lastOfferedAt: "2026-08-01T00:00:00.000Z",
  lastAssignedAt: null,
  lastLoginAt: "2026-08-02T12:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-08-02T12:00:00.000Z",
};

const sampleUser: User = {
  _id: "user-1",
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
};

describe("export-excel", () => {
  it("maps expert fields for Excel rows", () => {
    expect(expertToExportRow(sampleExpert)).toMatchObject({
      Name: "Jordan Lee",
      Email: "jordan@example.com",
      Status: "active",
      Type: "Internal",
      Available: "No",
      Countries: "US, CA",
      Expertise: "Ancient coins",
      "Years of experience": "12 years",
      "Active requests": 2,
      Completed: 8,
      "Missed deadlines": 2,
      "Success rate %": 80,
      "Avg completion hours (last 5)": 4.5,
      "Mongo ID": "exp-1",
    });
  });

  it("maps user fields for Excel rows", () => {
    expect(userToExportRow(sampleUser)).toMatchObject({
      Name: "Alice",
      Email: "alice@example.com",
      "External user ID": "ext-1",
      "Credit balance": 5,
      "Total requests": 10,
      "Active requests": 2,
      "Completed requests": 7,
      "Missed deadlines": 1,
      "Credits spent": 10,
      "Completion rate %": 88,
      "Mongo ID": "user-1",
    });
  });

  it("falls back when expert has no country list", () => {
    expect(
      expertToExportRow({ ...sampleExpert, supportedCountries: [] }).Countries,
    ).toBe("All countries");
  });
});
