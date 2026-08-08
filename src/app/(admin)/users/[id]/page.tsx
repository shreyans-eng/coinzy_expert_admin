"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { CreditAdjustModal } from "@/components/users/CreditAdjustModal";
import { CreateRequestModal } from "@/components/users/CreateRequestModal";
import { Button } from "@/components/ui/Button";
import {
  Card,
  LoadingState,
  PageHeader,
} from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { listUsers } from "@/lib/admin-api";
import { useApiHandler } from "@/lib/useApiHandler";
import type { User } from "@/types/admin-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    try {
      const users = await listUsers(adminKey);
      const found = users.find((u) => u._id === id) ?? null;
      setUser(found);
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
  if (!user) {
    return (
      <div className="py-16 text-center text-text-muted">User not found</div>
    );
  }

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Account">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">External ID</dt>
              <dd className="font-mono text-xs">{user.externalUserId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Credit balance</dt>
              <dd className="text-lg font-bold text-primary">
                {user.creditBalance}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Member since</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Actions">
          <p className="mb-4 text-sm text-text-muted">
            Adjust credits or create a request on behalf of this user.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
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
