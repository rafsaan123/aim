"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/mobile/MobileShell";
import { WrittenTestPage } from "@/components/tests/WrittenTestPage";
import { TestTimer } from "@/components/tests/TestTimer";
import { Button, Card, Field, Textarea } from "@/components/ui";

type Question = {
  id: string;
  type: "MCQ" | "SHORT_ANSWER";
  question: string;
  options: string[] | null;
  maxMarks: number;
};

type Test = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  course: { title: string };
  questions: Question[];
};

type PageMode = "loading" | "online" | "written";

export default function TakeTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<PageMode>("loading");
  const [testId, setTestId] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [test, setTest] = useState<Test | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittedRef = useRef(false);

  useEffect(() => {
    params.then(({ id }) => {
      setTestId(id);

      fetch(`/api/student/tests/${id}/written`)
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (ok && d.test) {
            setMode("written");
            setLoading(false);
            return;
          }

          setMode("online");
          return fetch(`/api/student/tests/${id}/start`, { method: "POST" })
            .then(async (r) => {
              const data = await r.json();
              if (!r.ok) {
                setError(data.error || "Unable to start test");
                return;
              }
              if (data.expired) {
                setError("Time is up for this test session.");
                return;
              }
              setAttemptId(data.attemptId);
              setTest(data.test);
              setExpiresAt(data.expiresAt);
            })
            .finally(() => setLoading(false));
        })
        .catch(() => {
          setError("Unable to load test.");
          setLoading(false);
        });
    });
  }, [params]);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const handleSubmit = useCallback(
    async (autoSubmitted = false) => {
      if (!test || !attemptId || submittedRef.current) return;
      submittedRef.current = true;

      if (!autoSubmitted) {
        const missing = test.questions.filter((q) => !answers[q.id]?.trim());
        if (missing.length) {
          submittedRef.current = false;
          setError("Please answer all questions before submitting.");
          return;
        }
      }

      setSubmitting(true);
      setError("");

      try {
        const res = await fetch("/api/student/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testId: test.id,
            attemptId,
            autoSubmitted,
            answers: test.questions.map((q) => ({
              questionId: q.id,
              response: answers[q.id] || "",
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          submittedRef.current = false;
          setError(data.error || "Failed to submit test");
          return;
        }

        router.push("/student/results");
        router.refresh();
      } catch {
        submittedRef.current = false;
        setError("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [answers, attemptId, router, test]
  );

  const handleExpire = useCallback(() => {
    handleSubmit(true);
  }, [handleSubmit]);

  if (mode === "written") {
    return <WrittenTestPage testId={testId} />;
  }

  if (loading || mode === "loading") {
    return (
      <MobileShell title="Loading..." showNav={false}>
        <p className="text-center text-sm text-muted">Starting test...</p>
      </MobileShell>
    );
  }

  if (!test) {
    return (
      <MobileShell title="Test unavailable" showNav={false}>
        <p className="mb-4 text-center text-sm text-danger">
          {error || "Test not found"}
        </p>
        <Button onClick={() => router.push("/student/tests")} fullWidth>
          Back to Tests
        </Button>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={test.title}
      subtitle={
        test.durationMinutes
          ? `${test.course.title} · Online · ${test.durationMinutes} min`
          : `${test.course.title} · Online test`
      }
      showNav={false}
    >
      <TestTimer expiresAt={expiresAt} onExpire={handleExpire} />

      {test.description ? (
        <p className="mb-4 text-sm text-muted">{test.description}</p>
      ) : null}

      <div className="space-y-4">
        {test.questions.map((q, index) => (
          <Card key={q.id}>
            <p className="text-xs font-semibold uppercase text-muted">
              Question {index + 1} · {q.maxMarks} mark(s)
            </p>
            <p className="mt-2 font-medium">{q.question}</p>

            {q.type === "MCQ" && q.options ? (
              <div className="mt-3 space-y-2">
                {q.options.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                      answers[q.id] === option
                        ? "border-primary bg-indigo-50"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => setAnswer(q.id, option)}
                      className="accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <Field label="Your answer">
                <Textarea
                  rows={4}
                  placeholder="Write your answer..."
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                />
              </Field>
            )}
          </Card>
        ))}

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button
          onClick={() => handleSubmit(false)}
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </MobileShell>
  );
}
