"use client";

import { Button } from "@/components/ui/Button";
import { FormActionField } from "@/components/ui/FormActionField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { UserFilters, UserSortKey } from "@/lib/user-metrics";

type UserFilterBarProps = {
  draftFilters: UserFilters;
  draftSortKey: UserSortKey;
  onDraftFiltersChange: (next: UserFilters) => void;
  onDraftSortChange: (sortKey: UserSortKey) => void;
  onApply: () => void;
  onRefresh: () => void;
  hasActiveFilters: boolean;
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
  draftFilters,
  draftSortKey,
  onDraftFiltersChange,
  onDraftSortChange,
  onApply,
  onRefresh,
  hasActiveFilters,
  resultCount,
  totalCount,
}: UserFilterBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
      className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-input-bg/40 p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-[200px] flex-1">
        <Input
          label="Search"
          placeholder="Name or email…"
          value={draftFilters.search}
          onChange={(e) =>
            onDraftFiltersChange({ ...draftFilters, search: e.target.value })
          }
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          label="Sort by"
          value={draftSortKey}
          onChange={(e) => onDraftSortChange(e.target.value as UserSortKey)}
          options={SORT_OPTIONS}
        />
      </div>
      <FormActionField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="h-10">
            Apply
          </Button>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="secondary"
              className="h-10"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          ) : null}
        </div>
      </FormActionField>
      <p className="pb-2 text-xs text-text-muted sm:ml-auto">
        Showing {resultCount} of {totalCount}
      </p>
    </form>
  );
}
