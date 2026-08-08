"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { UserFleetDashboard } from "@/components/users/UserFleetDashboard";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/ui/Card";
import { FormActionField } from "@/components/ui/FormActionField";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { listUsers } from "@/lib/admin-api";
import { DEFAULT_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import {
  sortUsers,
  summarizeUserFleet,
  userStats,
  type UserSortKey,
} from "@/lib/user-metrics";
import { useApiHandler } from "@/lib/useApiHandler";
import type { User } from "@/types/admin-api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const SORT_OPTIONS = [
  { value: "most_requests", label: "Most requests" },
  { value: "most_active", label: "Most active" },
  { value: "most_credits", label: "Highest credits" },
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A–Z" },
];

export default function UsersPage() {
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortKey, setSortKey] = useState<UserSortKey>("most_requests");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(
    async (email?: string) => {
      setLoading(true);
      try {
        const data = await listUsers(adminKey, email);
        setUsers(data);
        setPage(1);
      } catch (err) {
        handleApiError(err, (msg) => showToast(msg, "error"));
      } finally {
        setLoading(false);
      }
    },
    [adminKey, handleApiError, showToast],
  );

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [sortKey]);

  const sorted = useMemo(() => sortUsers(users, sortKey), [users, sortKey]);
  const paginated = useMemo(
    () => paginateSlice(sorted, page, DEFAULT_PAGE_SIZE),
    [sorted, page],
  );
  const summary = useMemo(() => summarizeUserFleet(users), [users]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSearch(searchInput);
    void fetchUsers(searchInput.trim() || undefined);
  };

  const handleClear = () => {
    setSearchInput("");
    setEmailSearch("");
    void fetchUsers();
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Request activity, credits, and user management."
      />

      {!loading && users.length > 0 ? (
        <UserFleetDashboard summary={summary} />
      ) : null}

      <Card className="mb-6">
        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem_auto]"
        >
          <Input
            label="Search by email"
            placeholder="Partial email match…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Select
            label="Sort by"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as UserSortKey)}
            options={SORT_OPTIONS}
          />
          <FormActionField>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="h-10">
                Search
              </Button>
              {emailSearch ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </FormActionField>
        </form>
      </Card>

      <Card>
        {loading ? (
          <LoadingState label="Loading users…" />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description={
              emailSearch
                ? `No users matching "${emailSearch}"`
                : "No users in the system yet."
            }
          />
        ) : (
          <>
            <div className="-mx-4 overflow-x-auto sm:-mx-6">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-3 font-semibold sm:px-6">Name</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell sm:px-6">
                      Email
                    </th>
                    <th className="px-4 py-3 font-semibold sm:px-6">Requests</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell sm:px-6">
                      Active
                    </th>
                    <th className="hidden px-4 py-3 font-semibold lg:table-cell sm:px-6">
                      Completed
                    </th>
                    <th className="px-4 py-3 font-semibold sm:px-6">Credits</th>
                    <th className="hidden px-4 py-3 font-semibold xl:table-cell sm:px-6">
                      Last request
                    </th>
                    <th className="px-4 py-3 font-semibold sm:px-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.items.map((user) => {
                    const stats = userStats(user);
                    return (
                      <tr key={user._id} className="hover:bg-input-bg/50">
                        <td className="px-4 py-3 sm:px-6">
                          <div className="font-medium">{user.name}</div>
                          <p className="text-xs text-text-muted md:hidden">
                            {user.email}
                          </p>
                        </td>
                        <td className="hidden px-4 py-3 text-text-muted md:table-cell sm:px-6">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span className="font-semibold tabular-nums text-primary">
                            {stats.totalRequests}
                          </span>
                          {stats.creditsSpentOnRequests > 0 ? (
                            <p className="text-xs text-text-muted">
                              {stats.creditsSpentOnRequests} spent
                            </p>
                          ) : null}
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell sm:px-6">
                          {stats.activeRequests}
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell sm:px-6">
                          {stats.completedRequests}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {user.creditBalance}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-text-muted xl:table-cell sm:px-6">
                          {stats.lastRequestAt
                            ? new Date(stats.lastRequestAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right sm:px-6">
                          <Link href={`/users/${user._id}`}>
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={paginated.pagination.page}
              totalPages={paginated.pagination.totalPages}
              total={paginated.pagination.total}
              limit={paginated.pagination.limit}
              onPageChange={setPage}
              loading={loading}
            />
          </>
        )}
      </Card>
    </>
  );
}
