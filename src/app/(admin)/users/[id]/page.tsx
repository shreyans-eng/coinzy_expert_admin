"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { UserStatsPanel } from "@/components/users/UserStatsPanel";
import { CreditAdjustModal } from "@/components/users/CreditAdjustModal";
import { CreateRequestModal } from "@/components/users/CreateRequestModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  LoadingState,
  PageHeader,
} from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getUser } from "@/lib/admin-api";
import { formatLastLogin, userStats } from "@/lib/user-metrics";
import { useApiHandler } from "@/lib/useApiHandler";
import type { User, UserRequestStats } from "@/types/admin-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await getUser(adminKey, id);
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, id]);

  if (loading) return <LoadingState label="Loading user…" />;
  if (!user || !stats) {
    return (
      <div className="py-16 text-center text-text-muted">User not found</div>
    );
  }

  const activity = userStats({ ...user, stats });

  return (
    <>
      <PageHeader
        title={user.name}
        description={user.email}
        action={
          <Link href="/users">
            <Button variant="secondary" size="sm">
              Back to users
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Total requests
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {activity.totalRequests}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Active requests
          </p>
          <p className="mt-1 text-3xl font-bold">{activity.activeRequests}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Credit balance
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {user.creditBalance}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Credits spent
          </p>
          <p className="mt-1 text-3xl font-bold">
            {activity.creditsSpentOnRequests}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UserStatsPanel stats={stats} creditBalance={user.creditBalance} />

        <Card title="Account details">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">MongoDB ID</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-xs">
                {user._id}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">External ID</dt>
              <dd className="font-mono text-xs">{user.externalUserId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Email</dt>
              <dd className="text-text-muted">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Credits</dt>
              <dd>
                <Badge variant="default">{user.creditBalance}</Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Member since</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Last updated</dt>
              <dd>{new Date(user.updatedAt).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Last login</dt>
              <dd>{formatLastLogin(user.lastLoginAt)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setCreditModalOpen(true)}>
              Adjust credits
            </Button>
            <Button
              variant="secondary"
              onClick={() => setRequestModalOpen(true)}
            >
              Create request
            </Button>
          </div>
        </Card>
      </div>

      <CreditAdjustModal
        open={creditModalOpen}
        userId={user._id}
        currentBalance={user.creditBalance}
        onClose={() => setCreditModalOpen(false)}
        onSuccess={(newBalance) => {
          setUser({ ...user, creditBalance: newBalance });
          setCreditModalOpen(false);
        }}
      />

      <CreateRequestModal
        open={requestModalOpen}
        userId={user._id}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          void loadUser();
          setRequestModalOpen(false);
        }}
      />
    </>
  );
}
