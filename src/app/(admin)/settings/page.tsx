"use client";

import { useLogout } from "@/components/layout/AdminAuthGuard";
import { getApiBaseUrl } from "@/lib/api-client";
import { clearAdminKey, getAdminKey, setAdminKey } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

export default function SettingsPage() {
  const logout = useLogout();
  const { showToast } = useToast();
  const [apiKey, setApiKeyInput] = useState(getAdminKey() ?? "");

  const handleUpdateKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      showToast("API key cannot be empty", "error");
      return;
    }
    setAdminKey(trimmed);
    showToast("API key updated for this session", "success");
  };

  const handleClearKey = () => {
    clearAdminKey();
    logout();
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Session and connection configuration."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="API connection">
          <dl className="mb-4 space-y-3 text-sm">
            <div>
              <dt className="text-text-muted">Base URL</dt>
              <dd className="mt-0.5 font-mono text-xs">{getApiBaseUrl()}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Auth header</dt>
              <dd className="mt-0.5 font-mono text-xs">x-admin-key</dd>
            </div>
          </dl>
          <p className="text-xs text-text-muted">
            Configure{" "}
            <code className="rounded bg-input-bg px-1 py-0.5">
              NEXT_PUBLIC_API_BASE_URL
            </code>{" "}
            in <code className="rounded bg-input-bg px-1 py-0.5">.env.local</code>
          </p>
        </Card>

        <Card title="Admin API key">
          <p className="mb-4 text-sm text-text-muted">
            Update the key used for this browser session. Stored in
            sessionStorage only.
          </p>
          <div className="space-y-4">
            <Input
              label="API key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              autoComplete="off"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleUpdateKey}>Update key</Button>
              <Button variant="danger" onClick={handleClearKey}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
