"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Badge, Button, Card, Field, Input } from "@/components/ui";

type Attempt = {
  id: string;
  status: string;
  submittedAt: string;
  obtainedMarks: number | null;
  totalMarks: number | null;
  user: { name: string; email: string };
  test: {
    title: string;
    course: { title: string };
    questions: { id: string; maxMarks: number }[];
  };
  answers: {
    id: string;
    response: string;
    marksAwarded: number | null;
    feedback: string | null;
    question: {
      id: string;
      type: string;
      question: string;
      maxMarks: number;
    };
  }[];
};

export default function AdminGradingPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [grades, setGrades] = useState<
    Record<string, { marks: number; feedback: string }>
  >({});
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/grading");
    const data = await res.json();
    setAttempts(data.attempts || []);
  }

  useEffect(() => {
    load();
  }, []);

  function initGrades(attempt: Attempt) {
    const initial: Record<string, { marks: number; feedback: string }> = {};
    for (const answer of attempt.answers) {
      if (answer.question.type === "SHORT_ANSWER") {
        initial[answer.id] = {
          marks: answer.marksAwarded ?? 0,
          feedback: answer.feedback ?? "",
        };
      }
    }
    setGrades(initial);
    setExpanded(attempt.id);
  }

  async function submitGrades(attemptId: string, attempt: Attempt) {
    const shortAnswers = attempt.answers.filter(
      (a) => a.question.type === "SHORT_ANSWER"
    );

    const res = await fetch("/api/admin/grading", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        grades: shortAnswers.map((a) => ({
          answerId: a.id,
          marksAwarded: grades[a.id]?.marks ?? 0,
          feedback: grades[a.id]?.feedback ?? "",
        })),
      }),
    });

    if (res.ok) {
      setMessage("Grades saved and result published to student");
      setExpanded(null);
      load();
    }
  }

  const pending = attempts.filter((a) => a.status === "SUBMITTED");
  const graded = attempts.filter((a) => a.status === "GRADED");

  return (
    <AdminShell title="Grade Tests">
      {message ? (
        <p className="mb-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-success">
          {message}
        </p>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Pending review ({pending.length})
      </h2>
      <div className="space-y-2">
        {pending.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No tests waiting for grading.</p>
          </Card>
        ) : (
          pending.map((attempt) => (
            <Card key={attempt.id}>
              <Badge tone="warning">Needs grading</Badge>
              <p className="mt-2 font-semibold">{attempt.test.title}</p>
              <p className="text-sm text-muted">
                {attempt.user.name} · {attempt.test.course.title}
              </p>
              <Button
                className="mt-3"
                fullWidth
                onClick={() => initGrades(attempt)}
              >
                Review & grade
              </Button>

              {expanded === attempt.id ? (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  {attempt.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="rounded-xl bg-slate-50 p-3 text-sm"
                    >
                      <p className="font-medium">{answer.question.question}</p>
                      <p className="mt-1 text-muted">
                        Answer: {answer.response}
                      </p>
                      {answer.question.type === "SHORT_ANSWER" ? (
                        <div className="mt-2 space-y-2">
                          <Field label={`Marks (max ${answer.question.maxMarks})`}>
                            <Input
                              type="number"
                              min={0}
                              max={answer.question.maxMarks}
                              value={grades[answer.id]?.marks ?? 0}
                              onChange={(e) =>
                                setGrades((prev) => ({
                                  ...prev,
                                  [answer.id]: {
                                    ...prev[answer.id],
                                    marks: parseInt(e.target.value) || 0,
                                    feedback: prev[answer.id]?.feedback ?? "",
                                  },
                                }))
                              }
                            />
                          </Field>
                          <Field label="Feedback (optional)">
                            <Input
                              value={grades[answer.id]?.feedback ?? ""}
                              onChange={(e) =>
                                setGrades((prev) => ({
                                  ...prev,
                                  [answer.id]: {
                                    marks: prev[answer.id]?.marks ?? 0,
                                    feedback: e.target.value,
                                  },
                                }))
                              }
                            />
                          </Field>
                        </div>
                      ) : (
                        <p className="mt-1 font-medium text-success">
                          MCQ auto-graded: {answer.marksAwarded}/
                          {answer.question.maxMarks}
                        </p>
                      )}
                    </div>
                  ))}
                  <Button
                    fullWidth
                    onClick={() => submitGrades(attempt.id, attempt)}
                  >
                    Save grades & publish result
                  </Button>
                </div>
              ) : null}
            </Card>
          ))
        )}
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
        Graded ({graded.length})
      </h2>
      <div className="space-y-2">
        {graded.map((attempt) => (
          <Card key={attempt.id}>
            <Badge tone="success">Graded</Badge>
            <p className="mt-2 font-semibold">{attempt.test.title}</p>
            <p className="text-sm text-muted">{attempt.user.name}</p>
            <p className="mt-1 font-medium">
              Score: {attempt.obtainedMarks}/{attempt.totalMarks}
            </p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
