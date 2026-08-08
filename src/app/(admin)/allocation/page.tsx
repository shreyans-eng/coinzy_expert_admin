"use client";

import { useAdminKey } from "@/components/layout/AdminAuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { getAllocationSummary } from "@/lib/admin-api";
import { useApiHandler } from "@/lib/useApiHandler";
import type {
  AllocationAttempt,
  AllocationStage,
  AllocationSummaryByStage,
  AllocationSummaryForStage,
} from "@/types/admin-api";
import { useState } from "react";

const STAGE_OPTIONS = [
  { value: "", label: "All stages" },
  { value: "initial", label: "Initial" },
  { value: "first_window_expired", label: "First window expired" },
  { value: "skip_refill", label: "Skip refill" },
];

const STAGE_LABELS: Record<AllocationStage, string> = {
  initial: "Initial",
  first_window_expired: "First window expired",
  skip_refill: "Skip refill",
};

function AttemptTable({ attempt }: { attempt: AllocationAttempt }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <div className="border-b border-border bg-input-bg/50 px-4 py-2 text-xs text-text-muted">
        Round {attempt.round} ·{" "}
        {new Date(attempt.attemptedAt).toLocaleString()} · ID{" "}
        <span className="font-mono">{attempt.attemptId}</span>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
            <th className="px-4 py-2 font-semibold">Rank</th>
            <th className="px-4 py-2 font-semibold">Expert ID</th>
            <th className="px-4 py-2 font-semibold">Score</th>
            <th className="hidden px-4 py-2 font-semibold sm:table-cell">
              Workload
            </th>
            <th className="hidden px-4 py-2 font-semibold sm:table-cell">
              Speed
            </th>
            <th className="px-4 py-2 font-semibold">Offered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {attempt.summary.map((row) => (
            <tr key={`${attempt.attemptId}-${row.expertId}-${row.rank}`}>
              <td className="px-4 py-2 font-medium">{row.rank}</td>
              <td className="px-4 py-2 font-mono text-xs">{row.expertId}</td>
              <td className="px-4 py-2 font-semibold">{row.score}</td>
              <td className="hidden px-4 py-2 sm:table-cell">
                {row.workloadPenalty}
              </td>
              <td className="hidden px-4 py-2 sm:table-cell">
                {row.speedPenalty}
              </td>
              <td className="px-4 py-2">
                {row.offered ? (
                  <Badge variant="success">Yes</Badge>
                ) : (
                  <Badge variant="muted">No</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AllocationPage() {
  const adminKey = useAdminKey();
  const handleApiError = useApiHandler();
  const { showToast } = useToast();

  const [requestId, setRequestId] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<
    AllocationSummaryByStage | AllocationSummaryForStage | null
  >(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = requestId.trim();
    if (!trimmed) {
      showToast("Enter a request MongoDB _id", "error");
      return;
    }

    setLoading(true);
    setSummary(null);
    try {
      const data = await getAllocationSummary(
        adminKey,
        trimmed,
        stage ? (stage as AllocationStage) : undefined,
      );
      setSummary(data);
    } catch (err) {
      handleApiError(err, (msg) => showToast(msg, "error"));
    } finally {
      setLoading(false);
    }
  };

  const isStageFiltered = (
    data: AllocationSummaryByStage | AllocationSummaryForStage,
  ): data is AllocationSummaryForStage => "stage" in data && "attempts" in data;

  return (
    <>
      <PageHeader
        title="Allocation summary"
        description="Audit expert scoring and ranking for a request. Use the MongoDB _id, not the display ID (EV-…)."
      />

      <Card title="Lookup request" className="mb-6">
        <form
          onSubmit={handleLookup}
          className="flex flex-col gap-4 lg:flex-row lg:items-end"
        >
          <div className="flex-1">
            <Input
              label="Request ID"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="507f1f77bcf86cd799439077"
              hint="MongoDB ObjectId — not the display ID"
            />
          </div>
          <div className="w-full lg:w-48">
            <Select
              label="Stage filter"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              options={STAGE_OPTIONS}
            />
          </div>
          <Button type="submit" loading={loading} className="shrink-0">
            Load summary
          </Button>
        </form>
      </Card>

      {loading ? <LoadingState label="Loading allocation summary…" /> : null}

      {!loading && summary ? (
        <div className="space-y-6">
          {isStageFiltered(summary) ? (
            <Card title={`Stage: ${STAGE_LABELS[summary.stage]}`}>
              {summary.attempts.length === 0 ? (
                <EmptyState title="No attempts for this stage" />
              ) : (
                <div className="space-y-4">
                  {summary.attempts.map((attempt) => (
                    <AttemptTable key={attempt.attemptId} attempt={attempt} />
                  ))}
                </div>
              )}
            </Card>
          ) : (
            (Object.keys(summary.stages) as AllocationStage[]).map(
              (stageKey) => {
                const attempts = summary.stages[stageKey] ?? [];
                if (attempts.length === 0) return null;
                return (
                  <Card key={stageKey} title={STAGE_LABELS[stageKey]}>
                    <div className="space-y-4">
                      {attempts.map((attempt) => (
                        <AttemptTable
                          key={attempt.attemptId}
                          attempt={attempt}
                        />
                      ))}
                    </div>
                  </Card>
                );
              },
            )
          )}
        </div>
      ) : !loading && !summary ? (
        <EmptyState
          title="No allocation data loaded"
          description="Enter a request ID above to view scoring history."
        />
      ) : null}
    </>
  );
}
