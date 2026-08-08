"use client";

import { adminFetch } from "@/lib/api-client";
import { setAdminKey } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  );
}

function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError("Admin API key is required");
      return;
    }

    setLoading(true);
    try {
      await adminFetch("/admin/experts", {
        method: "GET",
        adminKey: trimmed,
      });
      setAdminKey(trimmed);
      showToast("Signed in successfully", "success");
      router.push("/experts");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid admin API key";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-md">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Coinzy Admin
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Enter your admin API key to access the portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
        >
          <Input
            label="Admin API key"
            type="password"
            autoComplete="off"
            placeholder="Enter x-admin-key value"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            error={error}
            hint="Stored in sessionStorage for this browser session only"
          />

          <Button
            type="submit"
            className="mt-6 w-full"
            size="lg"
            loading={loading}
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Backend must be running with matching{" "}
          <code className="rounded bg-input-bg px-1 py-0.5 font-mono text-[11px]">
            ADMIN_API_KEY
          </code>
        </p>
      </div>
    </div>
  );
}
