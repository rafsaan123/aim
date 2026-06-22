"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";

type WrittenQuestion = {
  id: string;
  question: string;
  maxMarks: number;
};

type WrittenTest = {
  id: string;
  title: string;
  description: string | null;
  course: { title: string };
  questions: WrittenQuestion[];
};

export function WrittenTestPage({ testId }: { testId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"questions" | "submit">("questions");
  const [test, setTest] = useState<WrittenTest | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/student/tests/${testId}/written`)
      .then((r) => r.json())
      .then((d) => {
        if (d.test) {
          setTest(d.test);
          setSubmitted(d.submitted);
        } else {
          setError(d.error || "Test not found");
        }
      })
      .finally(() => setLoading(false));
  }, [testId]);

  async function handleSubmit() {
    if (!test) return;

    const hasPhoto = !!answerSheet;
    const allTyped = test.questions.every((q) => answers[q.id]?.trim());

    if (!hasPhoto && !allTyped) {
      setError(
        "Upload one photo of your written answer sheet, or type an answer for every question."
      );
      setTab("submit");
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append(
      "answers",
      JSON.stringify(
        test.questions.map((q) => ({
          questionId: q.id,
          response: answers[q.id] || "",
        }))
      )
    );

    if (answerSheet) formData.append("answerSheet", answerSheet);

    const res = await fetch(`/api/student/tests/${testId}/written`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Submission failed");
      setSubmitting(false);
      return;
    }

    setMessage("Your written test has been submitted for grading.");
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => router.push("/student/results"), 1500);
  }

  if (loading) {
    return (
      <MobileShell title="Loading" showNav={false} backHref="/student/tests">
        <p className="text-center text-sm text-muted">Please wait...</p>
      </MobileShell>
    );
  }

  if (!test) {
    return (
      <MobileShell title="Unavailable" showNav={false} backHref="/student/tests">
        <p className="text-center text-sm text-danger">{error || "Not found"}</p>
        <Button className="mt-4" fullWidth onClick={() => router.push("/student/tests")}>
          Back
        </Button>
      </MobileShell>
    );
  }

  if (submitted) {
    return (
      <MobileShell
        title={test.title}
        subtitle={test.course.title}
        showNav={false}
        backHref="/student/tests"
      >
        <Card>
          <p className="text-sm text-success">Submitted. Results appear after grading.</p>
        </Card>
        <Button className="mt-4" fullWidth onClick={() => router.push("/student/results")}>
          View results
        </Button>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      title={test.title}
      subtitle={test.course.title}
      showNav={false}
      backHref="/student/tests"
    >
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("questions")}
          className={`rounded-lg py-2.5 text-sm font-semibold ${
            tab === "questions" ? "bg-primary text-white" : "text-muted"
          }`}
        >
          Questions
        </button>
        <button
          type="button"
          onClick={() => setTab("submit")}
          className={`rounded-lg py-2.5 text-sm font-semibold ${
            tab === "submit" ? "bg-primary text-white" : "text-muted"
          }`}
        >
          Submit answers
        </button>
      </div>

      {test.description ? (
        <p className="mb-4 text-sm text-muted">{test.description}</p>
      ) : null}

      {tab === "questions" ? (
        <div className="space-y-3">
          <Card className="border-indigo-200 bg-indigo-50 text-sm text-indigo-800">
            Read these questions and write your answers on paper. When ready,
            go to <strong>Submit answers</strong> to upload one photo of your
            answer sheet and/or type your answers.
          </Card>
          {test.questions.map((q, index) => (
            <Card key={q.id}>
              <p className="text-xs font-semibold uppercase text-muted">
                Question {index + 1} · {q.maxMarks} mark(s)
              </p>
              <p className="mt-2 font-medium whitespace-pre-wrap">{q.question}</p>
            </Card>
          ))}
          <Button fullWidth onClick={() => setTab("submit")}>
            Go to submit answers
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="space-y-3 border-indigo-200 bg-indigo-50">
            <p className="text-xs font-semibold uppercase text-indigo-700">
              Answer sheet photo
            </p>
            <p className="text-sm text-indigo-900">
              Take one clear photo of your handwritten answers for all questions.
              You can also type answers below instead.
            </p>
            <Field label="Photo of your answer sheet">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setAnswerSheet(e.target.files?.[0] || null)}
              />
            </Field>
            {answerSheet ? (
              <p className="text-xs text-indigo-800">Selected: {answerSheet.name}</p>
            ) : null}
          </Card>

          {test.questions.map((q, index) => (
            <Card key={q.id} className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted">
                Answer {index + 1} · {q.maxMarks} mark(s)
              </p>
              <p className="text-sm font-medium">{q.question}</p>
              <Field label="Typed answer (optional if uploading photo)">
                <Textarea
                  rows={3}
                  placeholder="Type your written answer here..."
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              </Field>
            </Card>
          ))}

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}

          <Button fullWidth onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit written test"}
          </Button>
        </div>
      )}

      <Button
        variant="secondary"
        fullWidth
        className="mt-4"
        onClick={() => router.push("/student/tests")}
      >
        Back to tests
      </Button>
    </MobileShell>
  );
}
