"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { listUsers } from "@/lib/admin-api";
import { useApiHandler } from "@/lib/useApiHandler";
import type { User } from "@/types/admin-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function UsersPage() {
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(
    async (email?: string) => {
      setLoading(true);
      try {
        const data = await listUsers(adminKey, email);
        setUsers(data);
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
        description="Search mobile users and manage credits or requests."
      />

      <Card className="mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Input
              label="Search by email"
              placeholder="Partial email match…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Search</Button>
            {emailSearch ? (
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            ) : null}
          </div>
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
          <div className="-mx-4 overflow-x-auto sm:-mx-6">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-semibold sm:px-6">Name</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Email</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell sm:px-6">
                    External ID
                  </th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Credits</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell sm:px-6">
                    Joined
                  </th>
                  <th className="px-4 py-3 font-semibold sm:px-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-input-bg/50">
                    <td className="px-4 py-3 font-medium sm:px-6">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-text-muted sm:px-6">
                      {user.email}
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-text-muted md:table-cell sm:px-6">
                      {user.externalUserId}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {user.creditBalance}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-text-muted lg:table-cell sm:px-6">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6">
                      <Link href={`/users/${user._id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
