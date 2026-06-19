"use client";

import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Card, EmptyState } from "@/components/ui";

type Result = {
  id: string;
  status: string;
  submittedAt: string;
  obtainedMarks: number | null;
  totalMarks: number | null;
  test: {
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

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/results")
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell title="Results" subtitle="Your test scores and feedback">
      {loading ? (
        <p className="text-center text-sm text-muted">Loading results...</p>
      ) : results.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Complete a test and your results will appear here automatically."
        />
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <Card key={result.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge>{result.test.course.title}</Badge>
                  <h3 className="mt-2 font-semibold">{result.test.title}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(result.submittedAt).toLocaleDateString()}
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

              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === result.id ? null : result.id)
                }
                className="mt-3 text-sm font-medium text-primary"
              >
                {expanded === result.id ? "Hide details" : "View details"}
              </button>

              {expanded === result.id ? (
                <div className="mt-3 space-y-3 border-t border-border pt-3">
                  {result.answers.map((answer, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p className="font-medium">{answer.question.question}</p>
                      <p className="mt-1 text-muted">
                        Your answer: {answer.response}
                      </p>
                      {answer.marksAwarded !== null ? (
                        <p className="mt-1 font-medium">
                          Marks: {answer.marksAwarded}/{answer.question.maxMarks}
                        </p>
                      ) : null}
                      {answer.feedback ? (
                        <p className="mt-1 text-muted">
                          Feedback: {answer.feedback}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </MobileShell>
  );
}
