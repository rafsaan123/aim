"use client";

import { Badge, Card } from "@/components/ui";

export type ScoreboardEntry = {
  rank: number;
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
  emptyMessage?: string;
};

export function Scoreboard({
  title,
  subtitle,
  entries,
  loading,
  emptyMessage = "No scores yet.",
}: ScoreboardProps) {
  if (loading) {
    return (
      <Card>
        <p className="text-sm text-muted">Loading scoreboard...</p>
      </Card>
    );
  }

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
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
      </div>
      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const highlighted = entry.isCurrentUser;
          const isTopThree = entry.rank <= 3;

          return (
            <div
              key={`${entry.rank}-${entry.name}`}
              className={`flex items-center gap-3 px-4 py-3 ${
                highlighted ? "bg-indigo-50" : ""
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isTopThree
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-muted"
                }`}
              >
                {entry.rank}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {entry.name}
                  {entry.isCurrentUser ? (
                    <span className="ml-1 text-xs text-primary">(You)</span>
                  ) : null}
                </p>
                {entry.email ? (
                  <p className="truncate text-xs text-muted">{entry.email}</p>
                ) : null}
              </div>
              <div className="text-right">
                {entry.status === "SUBMITTED" ? (
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
        })}
      </div>
    </Card>
  );
}
