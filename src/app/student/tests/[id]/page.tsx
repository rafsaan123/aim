"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/mobile/MobileShell";
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
  course: { title: string };
  questions: Question[];
};

export default function TakeTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [testId, setTestId] = useState<string>("");
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setTestId(id);
      fetch(`/api/student/results?testId=${id}`)
        .then((r) => r.json())
        .then((d) => setTest(d.test))
        .finally(() => setLoading(false));
    });
  }, [params]);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    if (!test) return;

    const missing = test.questions.filter((q) => !answers[q.id]?.trim());
    if (missing.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/student/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          answers: test.questions.map((q) => ({
            questionId: q.id,
            response: answers[q.id],
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit test");
        return;
      }

      router.push("/student/results");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MobileShell title="Loading..." showNav={false}>
        <p className="text-center text-sm text-muted">Loading test...</p>
      </MobileShell>
    );
  }

  if (!test) {
    return (
      <MobileShell title="Test not found" showNav={false}>
        <Button onClick={() => router.push("/student/tests")} fullWidth>
          Back to Tests
        </Button>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={test.title}
      subtitle={test.course.title}
      showNav={false}
    >
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

        <Button onClick={handleSubmit} fullWidth disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </MobileShell>
  );
}
