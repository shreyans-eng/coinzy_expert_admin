"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { ExpertActiveRequestsPanel } from "@/components/experts/ExpertActiveRequestsPanel";
import { ExpertActivityTimeline } from "@/components/experts/ExpertActivityTimeline";
import { ExpertAllocationLookup } from "@/components/experts/ExpertAllocationLookup";
import { ExpertPerformancePanel } from "@/components/experts/ExpertPerformancePanel";
import { ExpertProfileHeader } from "@/components/experts/ExpertProfileHeader";
import { Badge, statusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, LoadingState, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import {
  getExpert,
  updateExpert,
  updateExpertStatus,
} from "@/lib/admin-api";
import { useApiHandler } from "@/lib/useApiHandler";
import type { Expert, ExpertStatus } from "@/types/admin-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "overview" | "edit" | "allocation";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "edit", label: "Edit profile" },
  { id: "allocation", label: "Allocation" },
];

export default function ExpertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();

  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [statusDialog, setStatusDialog] = useState<ExpertStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    supportedCountries: "",
    profilePicture: "",
    oneLineDescription: "",
  });

  const loadExpert = async () => {
    setLoading(true);
    try {
      const data = await getExpert(adminKey, id);
      setExpert(data);
      setForm({
        name: data.name,
        email: data.email,
        password: "",
        supportedCountries: data.supportedCountries.join(", "),
        profilePicture: data.profilePicture ?? "",
        oneLineDescription: data.oneLineDescription ?? "",
      });
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExpert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const countries = form.supportedCountries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      const body: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        supportedCountries: countries,
        profilePicture: form.profilePicture.trim() || null,
        oneLineDescription: form.oneLineDescription.trim() || null,
      };
      if (form.password.trim()) body.password = form.password;

      const updated = await updateExpert(adminKey, id, body);
      setExpert(updated);
      setForm((f) => ({ ...f, password: "" }));
      showToast("Expert updated", "success");
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setSaving(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusDialog) return;
    setStatusLoading(true);
    try {
      const updated = await updateExpertStatus(adminKey, id, statusDialog);
      setExpert(updated);
      showToast(`Status changed to ${statusDialog}`, "success");
      setStatusDialog(null);
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <LoadingState label="Loading expert…" />;
  if (!expert) {
    return (
      <div className="py-16 text-center text-text-muted">Expert not found</div>
    );
  }

  const statusOptions: ExpertStatus[] = ["active", "suspended", "blocked"];

  return (
    <>
      <PageHeader
        title="Expert detail"
        description="Performance, editing, and allocation audit."
        action={
          <Link href="/experts">
            <Button variant="secondary" size="sm">
              Back to list
            </Button>
          </Link>
        }
      />

      <ExpertProfileHeader expert={expert} />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-input-bg/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-surface text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          <ExpertPerformancePanel expert={expert} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpertActiveRequestsPanel expert={expert} />
            <ExpertActivityTimeline expert={expert} />
          </div>
          <Card title="Quick status actions">
            <p className="mb-4 text-sm text-text-muted">
              Current:{" "}
              <Badge variant={statusBadgeVariant(expert.status)}>
                {expert.status}
              </Badge>
            </p>
            <div className="flex flex-wrap gap-2">
              {statusOptions
                .filter((s) => s !== expert.status)
                .map((status) => (
                  <Button
                    key={status}
                    variant={status === "blocked" ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => setStatusDialog(status)}
                  >
                    Set {status}
                  </Button>
                ))}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card title="Edit expert profile">
              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label="New password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  hint="Leave blank to keep current password"
                />
                <Input
                  label="Supported countries"
                  value={form.supportedCountries}
                  onChange={(e) =>
                    setForm({ ...form, supportedCountries: e.target.value })
                  }
                  hint="Comma-separated ISO codes. Empty = all countries."
                  placeholder="IN, GB, US"
                />
                <Input
                  label="Profile picture URL"
                  type="url"
                  value={form.profilePicture}
                  onChange={(e) =>
                    setForm({ ...form, profilePicture: e.target.value })
                  }
                />
                {form.profilePicture.trim() ? (
                  <div className="rounded-xl border border-border bg-input-bg p-3">
                    <p className="mb-2 text-xs font-medium text-text-muted">
                      Preview
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.profilePicture.trim()}
                      alt="Profile preview"
                      className="h-20 w-20 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : null}
                <Textarea
                  label="One-line description"
                  value={form.oneLineDescription}
                  onChange={(e) =>
                    setForm({ ...form, oneLineDescription: e.target.value })
                  }
                  rows={3}
                />
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </form>
            </Card>
          </div>
          <Card title="Editable via API">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-muted">Availability</dt>
                <dd className="font-medium">
                  {expert.isAvailableForRequests
                    ? "Available (expert toggles in their app)"
                    : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Internal expert</dt>
                <dd className="font-medium">
                  {expert.isInternal ? "Yes — env-managed" : "No"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-text-muted">
              Bulk country reassignment (
              <code className="font-mono">PATCH /admin/experts/:id/countries</code>
              ) is not implemented yet. Edit countries in the form above.
            </p>
          </Card>
        </div>
      ) : null}

      {tab === "allocation" ? (
        <Card title="Allocation audit for this expert">
          <ExpertAllocationLookup
            expertId={expert._id}
            expertName={expert.name}
          />
        </Card>
      ) : null}

      <ConfirmDialog
        open={statusDialog !== null}
        title={`Change status to ${statusDialog}?`}
        description={`This will set the expert's account status to "${statusDialog}".`}
        confirmLabel={`Set ${statusDialog}`}
        variant={statusDialog === "blocked" ? "danger" : "primary"}
        loading={statusLoading}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusDialog(null)}
      />
    </>
  );
}
