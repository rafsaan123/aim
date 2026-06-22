"use client";

import { Badge, Card } from "@/components/ui";

export type ScoreboardEntry = {
  rank: number | null;
  studentId?: string;
  name: string;
  email?: string;
  obtainedMarks: number | null;
  totalMarks: number | null;
  status?: string;
  percentage: number | null;
  isCurrentUser?: boolean;
};

type ScoreboardProps = {
  title: string;
  subtitle?: string;
  entries: ScoreboardEntry[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
};

export function Scoreboard({
  title,
  subtitle,
  entries,
  loading,
  error,
  emptyMessage = "No scores yet.",
}: ScoreboardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100" />
              <div className="h-4 flex-1 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-danger">{error}</p>
      </Card>
    );
  }

  const graded = entries.filter((e) => e.status !== "SUBMITTED");
  const pending = entries.filter((e) => e.status === "SUBMITTED");

  if (entries.length === 0) {
    return (
      <Card>
        <h3 className="font-semibold">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        <p className="mt-3 text-sm text-muted">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-slate-50 px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
      </div>

      {graded.length > 0 ? (
        <div className="divide-y divide-border">
          {graded.map((entry) => (
            <ScoreboardRow key={entry.studentId ?? `${entry.name}-${entry.rank}`} entry={entry} />
          ))}
        </div>
      ) : null}

      {pending.length > 0 ? (
        <>
          <div className="border-t border-border bg-slate-50 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Awaiting grading
            </p>
          </div>
          <div className="divide-y divide-border">
            {pending.map((entry) => (
              <ScoreboardRow
                key={entry.studentId ?? entry.name}
                entry={entry}
                pending
              />
            ))}
          </div>
        </>
      ) : null}
    </Card>
  );
}

function ScoreboardRow({
  entry,
  pending = false,
}: {
  entry: ScoreboardEntry;
  pending?: boolean;
}) {
  const highlighted = entry.isCurrentUser;
  const isTopThree = entry.rank !== null && entry.rank <= 3;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        highlighted ? "bg-indigo-50/80" : ""
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          pending
            ? "bg-amber-50 text-warning"
            : isTopThree
              ? "bg-primary text-white"
              : "bg-slate-100 text-muted"
        }`}
      >
        {pending ? "—" : entry.rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {entry.name}
          {entry.isCurrentUser ? (
            <span className="ml-1 text-xs font-semibold text-primary">(You)</span>
          ) : null}
        </p>
        {entry.email ? (
          <p className="truncate text-xs text-muted">{entry.email}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        {pending ? (
          <Badge tone="warning">Pending</Badge>
        ) : (
          <>
            <p className="font-bold text-foreground">
              {entry.obtainedMarks}/{entry.totalMarks}
            </p>
            {entry.percentage !== null ? (
              <p className="text-xs text-muted">{entry.percentage}%</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
