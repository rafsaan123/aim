"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, Field, Input } from "@/components/ui";

type Attempt = {
  id: string;
  status: string;
  submittedAt: string | null;
  obtainedMarks: number | null;
  totalMarks: number | null;
  user: { name: string; email: string };
  test: {
    title: string;
    format: "ONLINE" | "WRITTEN";
    course: { title: string };
    questions: { id: string; maxMarks: number }[];
  };
  answers: {
    id: string;
    response: string;
    marksAwarded: number | null;
    feedback: string | null;
    attachmentFileName: string | null;
    question: {
      id: string;
      type: string;
      question: string;
      maxMarks: number;
    };
  }[];
};

export function AdminGradingPanel({ attempts }: { attempts: Attempt[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [grades, setGrades] = useState<
    Record<string, { marks: number; feedback: string }>
  >({});
  const [message, setMessage] = useState("");

  function needsManualGrading(attempt: Attempt, answer: Attempt["answers"][0]) {
    return (
      attempt.test.format === "WRITTEN" ||
      answer.question.type === "SHORT_ANSWER"
    );
  }

  function initGrades(attempt: Attempt) {
    const initial: Record<string, { marks: number; feedback: string }> = {};
    for (const answer of attempt.answers) {
      if (needsManualGrading(attempt, answer)) {
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
    const manualAnswers = attempt.answers.filter((a) =>
      needsManualGrading(attempt, a)
    );

    const res = await fetch("/api/admin/grading", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId,
        grades: manualAnswers.map((a) => ({
          answerId: a.id,
          marksAwarded: grades[a.id]?.marks ?? 0,
          feedback: grades[a.id]?.feedback ?? "",
        })),
      }),
    });

    if (res.ok) {
      setMessage("Grades saved and result published to student");
      setExpanded(null);
      router.refresh();
    }
  }

  const pending = attempts.filter((a) => a.status === "SUBMITTED");
  const graded = attempts.filter((a) => a.status === "GRADED");

  return (
    <>
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
              {attempt.test.format === "WRITTEN" ? (
                <Badge tone="success">Written</Badge>
              ) : null}
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
                      {answer.response ? (
                        <p className="mt-1 text-muted">
                          Answer: {answer.response}
                        </p>
                      ) : (
                        <p className="mt-1 italic text-muted">No typed answer</p>
                      )}
                      {answer.attachmentFileName ? (
                        <div className="mt-2">
                          <p className="text-xs text-muted">
                            Photo: {answer.attachmentFileName}
                          </p>
                          <img
                            src={`/api/admin/answers/${answer.id}/attachment`}
                            alt={`Answer photo for ${answer.question.question}`}
                            className="mt-2 max-h-64 w-full rounded-lg border border-border object-contain bg-white"
                          />
                        </div>
                      ) : null}
                      {needsManualGrading(attempt, answer) ? (
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
    </>
  );
}
