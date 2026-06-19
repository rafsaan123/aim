"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

type Course = { id: string; title: string };
type TestItem = {
  id: string;
  title: string;
  course: Course;
  _count: { questions: number; attempts: number };
};

type QuestionDraft = {
  type: "MCQ" | "SHORT_ANSWER";
  question: string;
  options: string[];
  correctAnswer: string;
  maxMarks: number;
};

const emptyQuestion = (): QuestionDraft => ({
  type: "MCQ",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  maxMarks: 1,
});

export default function AdminTestsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/tests");
    const data = await res.json();
    setCourses(data.courses || []);
    setTests(data.tests || []);
  }

  useEffect(() => {
    load();
  }, []);

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[oIndex] = value;
        return { ...q, options };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      courseId,
      title,
      description,
      questions: questions.map((q) => ({
        type: q.type,
        question: q.question,
        options: q.type === "MCQ" ? q.options.filter(Boolean) : undefined,
        correctAnswer: q.type === "MCQ" ? q.correctAnswer : undefined,
        maxMarks: q.maxMarks,
      })),
    };

    const res = await fetch("/api/admin/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create test");
      return;
    }

    setMessage("Test created successfully");
    setTitle("");
    setDescription("");
    setQuestions([emptyQuestion()]);
    load();
  }

  async function deleteTest(test: TestItem) {
    const warning =
      test._count.attempts > 0
        ? `This test has ${test._count.attempts} student attempt(s). Deleting it will also remove all questions and results. Continue?`
        : `Delete "${test.title}" and all ${test._count.questions} question(s)?`;

    if (!confirm(warning)) return;

    setDeletingId(test.id);
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/tests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId: test.id }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Test and questions deleted");
      load();
    } else {
      setError(data.error || "Failed to delete test");
    }
    setDeletingId(null);
  }

  return (
    <AdminShell title="Create Tests">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-3">
          <Field label="Course">
            <Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Test title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly Quiz 1"
              required
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </Field>
        </Card>

        {questions.map((q, index) => (
          <Card key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Question {index + 1}</p>
              {questions.length > 1 ? (
                <button
                  type="button"
                  className="text-sm text-danger"
                  onClick={() =>
                    setQuestions((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>

            <Field label="Type">
              <Select
                value={q.type}
                onChange={(e) =>
                  updateQuestion(index, {
                    type: e.target.value as "MCQ" | "SHORT_ANSWER",
                  })
                }
              >
                <option value="MCQ">Multiple Choice (auto-graded)</option>
                <option value="SHORT_ANSWER">
                  Short Answer (manual grading)
                </option>
              </Select>
            </Field>

            <Field label="Question">
              <Textarea
                value={q.question}
                onChange={(e) =>
                  updateQuestion(index, { question: e.target.value })
                }
                required
              />
            </Field>

            {q.type === "MCQ" ? (
              <>
                {q.options.map((opt, oi) => (
                  <Field key={oi} label={`Option ${oi + 1}`}>
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(index, oi, e.target.value)}
                    />
                  </Field>
                ))}
                <Field label="Correct answer (must match an option)">
                  <Input
                    value={q.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(index, { correctAnswer: e.target.value })
                    }
                    required
                  />
                </Field>
              </>
            ) : null}

            <Field label="Marks">
              <Input
                type="number"
                min={1}
                value={q.maxMarks}
                onChange={(e) =>
                  updateQuestion(index, {
                    maxMarks: parseInt(e.target.value) || 1,
                  })
                }
              />
            </Field>
          </Card>
        ))}

        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        >
          Add another question
        </Button>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <Button type="submit" fullWidth>
          Create test
        </Button>
      </form>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
        All tests ({tests.length})
      </h2>
      <div className="space-y-2">
        {tests.map((t) => (
          <Card key={t.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge>{t.course.title}</Badge>
                <p className="mt-2 font-semibold">{t.title}</p>
                <p className="text-xs text-muted">
                  {t._count.questions} questions · {t._count.attempts} attempts
                </p>
              </div>
              <Button
                variant="danger"
                className="shrink-0 px-3 py-2 text-xs"
                disabled={deletingId === t.id}
                onClick={() => deleteTest(t)}
              >
                {deletingId === t.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
