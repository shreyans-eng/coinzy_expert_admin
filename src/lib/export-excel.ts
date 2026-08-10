import * as XLSX from "xlsx";
import type { Expert, User } from "@/types/admin-api";
import { completionRate } from "@/lib/expert-metrics";
import {
  completionRateForUser,
  displayUserLabel,
  userStats,
} from "@/lib/user-metrics";

export type ExpertExportRow = {
  Name: string;
  Email: string;
  Status: string;
  Type: string;
  Available: string;
  Countries: string;
  "Active requests": number;
  Completed: number;
  "Missed deadlines": number;
  "Success rate %": number;
  "Avg completion hours (last 5)": number | string;
  "Last login": string;
  "Last offered": string;
  "Last assigned": string;
  "Created at": string;
  "Mongo ID": string;
};

export type UserExportRow = {
  Name: string;
  Email: string;
  "External user ID": string;
  "Credit balance": number;
  "Total requests": number;
  "Active requests": number;
  "Completed requests": number;
  "Missed deadlines": number;
  "Refunded requests": number;
  "Admin-created requests": number;
  "Credits spent": number;
  "Completion rate %": number;
  "Last request": string;
  "Last login": string;
  "Created at": string;
  "Mongo ID": string;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString();
}

export function expertToExportRow(expert: Expert): ExpertExportRow {
  return {
    Name: expert.name,
    Email: expert.email,
    Status: expert.status,
    Type: expert.isInternal ? "Internal" : "External",
    Available: expert.isAvailableForRequests ? "Yes" : "No",
    Countries:
      expert.supportedCountries.length > 0
        ? expert.supportedCountries.join(", ")
        : "All countries",
    "Active requests": expert.activeCommittedRequestCount,
    Completed: expert.stats.completedCount,
    "Missed deadlines": expert.stats.missedDeadlineCount,
    "Success rate %": completionRate(expert),
    "Avg completion hours (last 5)":
      expert.stats.avgCompletionHoursLast5 ?? "",
    "Last login": formatDate(expert.lastLoginAt),
    "Last offered": formatDate(expert.lastOfferedAt),
    "Last assigned": formatDate(expert.lastAssignedAt),
    "Created at": formatDate(expert.createdAt),
    "Mongo ID": expert._id,
  };
}

export function userToExportRow(user: User): UserExportRow {
  const stats = userStats(user);
  return {
    Name: displayUserLabel(user),
    Email: user.email ?? "",
    "External user ID": user.externalUserId,
    "Credit balance": user.creditBalance,
    "Total requests": stats.totalRequests,
    "Active requests": stats.activeRequests,
    "Completed requests": stats.completedRequests,
    "Missed deadlines": stats.deadlineMissedRequests,
    "Refunded requests": stats.refundedRequests,
    "Admin-created requests": stats.adminCreatedRequests,
    "Credits spent": stats.creditsSpentOnRequests,
    "Completion rate %": completionRateForUser(stats),
    "Last request": formatDate(stats.lastRequestAt),
    "Last login": formatDate(user.lastLoginAt),
    "Created at": formatDate(user.createdAt),
    "Mongo ID": user._id,
  };
}

function downloadWorkbook(
  sheetName: string,
  rows: Record<string, string | number>[],
  filename: string,
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

function stamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function downloadExpertsExcel(experts: Expert[], filenamePrefix = "experts") {
  const rows = experts.map(expertToExportRow);
  downloadWorkbook("Experts", rows, `${filenamePrefix}-${stamp()}.xlsx`);
}

export function downloadUsersExcel(users: User[], filenamePrefix = "users") {
  const rows = users.map(userToExportRow);
  downloadWorkbook("Users", rows, `${filenamePrefix}-${stamp()}.xlsx`);
}
