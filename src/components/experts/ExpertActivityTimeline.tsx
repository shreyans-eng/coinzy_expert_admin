import type { Expert } from "@/types/admin-api";

function formatRelative(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString();
}

export function ExpertActivityTimeline({ expert }: { expert: Expert }) {
  const events = [
    {
      label: "Last offered a request",
      at: expert.lastOfferedAt,
      color: "bg-info",
    },
    {
      label: "Last assigned a request",
      at: expert.lastAssignedAt,
      color: "bg-primary",
    },
    {
      label: "Account created",
      at: expert.createdAt,
      color: "bg-success",
    },
    {
      label: "Profile updated",
      at: expert.updatedAt,
      color: "bg-text-muted",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text">Activity timeline</h3>
      <ol className="relative mt-4 space-y-0 border-l border-border pl-6">
        {events.map((ev) => (
          <li key={ev.label} className="relative pb-6 last:pb-0">
            <span
              className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full ring-4 ring-surface ${ev.color}`}
            />
            <p className="text-sm font-medium text-text">{ev.label}</p>
            <p className="text-xs text-text-muted">
              {ev.at ? new Date(ev.at).toLocaleString() : "—"}
              {ev.at ? ` · ${formatRelative(ev.at)}` : ""}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
