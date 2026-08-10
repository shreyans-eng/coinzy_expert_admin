"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { adjustUserCredits, getUser } from "@/lib/admin-api";
import { useApiHandler } from "@/lib/useApiHandler";
import { useMemo, useState } from "react";

function offlineRefundReason(requestId: string) {
  return `offline_refund_approved_for_request_${requestId.trim()}`;
}

export function OfflineRefundForm() {
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();

  const [userId, setUserId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastBalance, setLastBalance] = useState<number | null>(null);

  const parsedAmount = Number.parseInt(amount, 10);
  const reason = useMemo(
    () => (requestId.trim() ? offlineRefundReason(requestId) : ""),
    [requestId],
  );

  const validate = () => {
    if (!userId.trim()) {
      setError("User MongoDB _id is required");
      return false;
    }
    if (!requestId.trim()) {
      setError("Request MongoDB _id is required (not the display ID)");
      return false;
    }
    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive integer");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const confirmRestore = async () => {
    setLoading(true);
    try {
      await getUser(adminKey, userId.trim());
      const result = await adjustUserCredits(adminKey, userId.trim(), {
        amount: parsedAmount,
        reason,
      });
      setLastBalance(result.creditBalance);
      showToast("Credits restored for offline refund", "success");
      setConfirmOpen(false);
      setRequestId("");
      setAmount("1");
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-text">
          <li>
            Confirm MongoDB <code className="font-mono text-xs">_id</code> values
            for the user and request (not display IDs).
          </li>
          <li>
            Process the <strong>Apple / Google store refund</strong> outside this
            app (App Store Connect / Play Console).
          </li>
          <li>Restore in-app credits with the form below.</li>
        </ol>

        <Input
          label="User MongoDB _id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="64f1…"
          hint="From Users → user detail"
          autoComplete="off"
        />
        <Input
          label="Request MongoDB _id"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          placeholder="64f2…"
          hint="Do not use the display / request number"
          autoComplete="off"
        />
        <Input
          label="Credits to restore"
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint="Usually the credits that were charged for the request"
          error={error}
        />

        <div className="rounded-xl border border-border bg-input-bg px-3 py-2">
          <p className="text-xs font-medium text-text-muted">Reason (auto-filled)</p>
          <p className="mt-1 break-all font-mono text-xs text-text">
            {reason || "offline_refund_approved_for_request_<requestId>"}
          </p>
        </div>

        {lastBalance !== null ? (
          <p className="text-sm text-text-muted">
            Last restored balance:{" "}
            <span className="font-semibold text-text">{lastBalance}</span>
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit">Restore credits</Button>
        </div>

        <p className="text-xs text-text-muted">
          This writes ledger type{" "}
          <code className="rounded bg-input-bg px-1 py-0.5">admin_adjustment</code>
          , not{" "}
          <code className="rounded bg-input-bg px-1 py-0.5">refund</code>. Request
          status is not updated automatically.
        </p>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm offline credit restore"
        description={`Add ${parsedAmount} credit(s) to user ${userId.trim()} with reason "${reason}". Store payment refund must already be handled outside this app.`}
        confirmLabel="Confirm restore"
        loading={loading}
        onConfirm={confirmRestore}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
