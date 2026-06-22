"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui";
import { Scoreboard, type ScoreboardEntry } from "@/components/tests/Scoreboard";

export type StudentResult = {
  id: string;
  status: string;
  submittedAt: string | null;
  obtainedMarks: number | null;
  totalMarks: number | null;
  test: {
    id: string;
    title: string;
    course: { title: string };
  };
  answers: {
    response: string;
    marksAwarded: number | null;
    feedback: string | null;
    question: {
      question: string;
      type: string;
      maxMarks: number;
    };
  }[];
};

export function StudentResultsPanel({ results }: { results: StudentResult[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scoreboardTestId, setScoreboardTestId] = useState<string | null>(null);
  const [scoreboardEntries, setScoreboardEntries] = useState<ScoreboardEntry[]>([]);
  const [scoreboardTitle, setScoreboardTitle] = useState("");
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [scoreboardLoading, setScoreboardLoading] = useState(false);
  const [scoreboardError, setScoreboardError] = useState("");

  async function toggleScoreboard(testId: string, testTitle: string) {
    if (scoreboardTestId === testId) {
      setScoreboardTestId(null);
      setScoreboardError("");
      return;
    }

    setScoreboardTestId(testId);
    setScoreboardTitle(testTitle);
    setScoreboardLoading(true);
    setScoreboardError("");
    setScoreboardEntries([]);

    try {
      const res = await fetch(`/api/student/tests/${testId}/scoreboard`);
      const data = await res.json();
      if (!res.ok) {
        setScoreboardError(data.error || "Could not load scoreboard.");
        return;
      }
      setScoreboardEntries(data.entries || []);
      setMyRank(data.myRank ?? null);
      setMyStatus(data.myStatus ?? null);
    } catch {
      setScoreboardError("Could not load scoreboard.");
    } finally {
      setScoreboardLoading(false);
    }
  }

  function scoreboardSubtitle() {
    if (myRank) return `Your rank: #${myRank}`;
    if (myStatus === "SUBMITTED") return "Your submission is being graded";
    return undefined;
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="No results yet"
        description="Complete a test and your score will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const isExpanded = expanded === result.id;
        const showScoreboard = scoreboardTestId === result.test.id;

        return (
          <Card key={result.id} className="overflow-hidden p-0">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge>{result.test.course.title}</Badge>
                  <h3 className="mt-2 font-semibold leading-snug">{result.test.title}</h3>
                  {result.submittedAt ? (
                    <p className="mt-1 text-xs text-muted">
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
                {result.status === "GRADED" ? (
                  <div className="shrink-0 rounded-xl bg-green-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-success">
                      {result.obtainedMarks}/{result.totalMarks}
                    </p>
                  </div>
                ) : (
                  <Badge tone="warning">Grading</Badge>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : result.id)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:bg-slate-50"
                >
                  {isExpanded ? (
                    <>
                      Hide <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Details <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleScoreboard(result.test.id, result.test.title)}
                  className={`inline-flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    showScoreboard
                      ? "bg-primary text-white"
                      : "border border-border bg-white text-foreground hover:bg-slate-50"
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  {showScoreboard ? "Hide" : "Rank"}
                </button>
              </div>
            </div>

            {isExpanded ? (
              <div className="space-y-2 border-t border-border bg-slate-50/80 px-4 py-3">
                {result.answers.map((answer, i) => (
                  <div key={i} className="rounded-xl bg-white p-3 text-sm">
                    <p className="font-medium">{answer.question.question}</p>
                    <p className="mt-1 text-muted">{answer.response}</p>
                    {answer.marksAwarded !== null ? (
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        {answer.marksAwarded}/{answer.question.maxMarks} marks
                      </p>
                    ) : null}
                    {answer.feedback ? (
                      <p className="mt-1 text-xs text-muted">{answer.feedback}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {showScoreboard ? (
              <div className="border-t border-border px-4 py-3">
                <Scoreboard
                  title={scoreboardTitle}
                  subtitle={scoreboardSubtitle()}
                  entries={scoreboardEntries}
                  loading={scoreboardLoading}
                  error={scoreboardError}
                  emptyMessage="No scores published yet."
                />
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
