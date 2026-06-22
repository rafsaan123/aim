"use client";

import { useState } from "react";
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
  const [scoreboardLoading, setScoreboardLoading] = useState(false);

  async function toggleScoreboard(testId: string, testTitle: string) {
    if (scoreboardTestId === testId) {
      setScoreboardTestId(null);
      return;
    }

    setScoreboardTestId(testId);
    setScoreboardTitle(testTitle);
    setScoreboardLoading(true);

    const res = await fetch(`/api/student/tests/${testId}/scoreboard`);
    const data = await res.json();
    setScoreboardEntries(data.entries || []);
    setMyRank(data.myRank ?? null);
    setScoreboardLoading(false);
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="No results yet"
        description="Complete a test and your results will appear here automatically."
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card key={result.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge>{result.test.course.title}</Badge>
              <h3 className="mt-2 font-semibold">{result.test.title}</h3>
              <p className="mt-1 text-xs text-muted">
                {result.submittedAt
                  ? new Date(result.submittedAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            {result.status === "GRADED" ? (
              <div className="rounded-xl bg-green-50 px-3 py-2 text-center">
                <p className="text-lg font-bold text-success">
                  {result.obtainedMarks}/{result.totalMarks}
                </p>
                <p className="text-[10px] uppercase text-success">Score</p>
              </div>
            ) : (
              <Badge tone="warning">Pending review</Badge>
            )}
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setExpanded(expanded === result.id ? null : result.id)
              }
              className="text-sm font-medium text-primary"
            >
              {expanded === result.id ? "Hide details" : "View details"}
            </button>
            <button
              type="button"
              onClick={() => toggleScoreboard(result.test.id, result.test.title)}
              className="text-sm font-medium text-primary"
            >
              {scoreboardTestId === result.test.id
                ? "Hide scoreboard"
                : "Scoreboard"}
            </button>
          </div>

          {expanded === result.id ? (
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              {result.answers.map((answer, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-medium">{answer.question.question}</p>
                  <p className="mt-1 text-muted">Your answer: {answer.response}</p>
                  {answer.marksAwarded !== null ? (
                    <p className="mt-1 font-medium">
                      Marks: {answer.marksAwarded}/{answer.question.maxMarks}
                    </p>
                  ) : null}
                  {answer.feedback ? (
                    <p className="mt-1 text-muted">Feedback: {answer.feedback}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {scoreboardTestId === result.test.id ? (
            <div className="mt-3 border-t border-border pt-3">
              <Scoreboard
                title={`${scoreboardTitle} — Class ranking`}
                subtitle={
                  myRank ? `Your rank: #${myRank}` : "You are not ranked yet"
                }
                entries={scoreboardEntries}
                loading={scoreboardLoading}
                emptyMessage="No scores published for this test yet."
              />
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
