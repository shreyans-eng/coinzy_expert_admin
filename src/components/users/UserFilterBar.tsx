"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type {
  UserActivityFilter,
  UserFilters,
  UserLastLoginFilter,
  UserSortKey,
} from "@/lib/user-metrics";

type UserFilterBarProps = {
  filters: UserFilters;
  onChange: (next: UserFilters) => void;
  sortKey: UserSortKey;
  onSortChange: (sortKey: UserSortKey) => void;
  resultCount: number;
  totalCount: number;
};

const SORT_OPTIONS = [
  { value: "most_requests", label: "Most requests" },
  { value: "most_active", label: "Most active" },
  { value: "most_credits", label: "Highest credits" },
  { value: "last_login_desc", label: "Last login (newest)" },
  { value: "last_login_asc", label: "Last login (oldest)" },
  { value: "newest", label: "Newest joined" },
  { value: "name", label: "Name A–Z" },
];

export function UserFilterBar({
  filters,
  onChange,
  sortKey,
  onSortChange,
  resultCount,
  totalCount,
}: UserFilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-input-bg/40 p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[200px] flex-1">
        <Input
          label="Search"
          placeholder="Name or email…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          label="Last login"
          value={filters.lastLogin}
          onChange={(e) =>
            onChange({
              ...filters,
              lastLogin: e.target.value as UserLastLoginFilter,
            })
          }
          options={[
            { value: "all", label: "All users" },
            { value: "last_7_days", label: "Logged in (7 days)" },
            { value: "last_30_days", label: "Logged in (30 days)" },
            { value: "older_30_days", label: "Inactive 30+ days" },
            { value: "never", label: "Never logged in" },
          ]}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          label="Activity"
          value={filters.activity}
          onChange={(e) =>
            onChange({
              ...filters,
              activity: e.target.value as UserActivityFilter,
            })
          }
          options={[
            { value: "all", label: "All activity" },
            { value: "has_active", label: "Has active requests" },
            { value: "has_requests", label: "Has any requests" },
            { value: "no_requests", label: "No requests yet" },
          ]}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          label="Sort by"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as UserSortKey)}
          options={SORT_OPTIONS}
        />
      </div>
      <p className="pb-2 text-xs text-text-muted sm:ml-auto">
        Showing {resultCount} of {totalCount}
      </p>
    </div>
  );
}
