"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { Scoreboard, type ScoreboardEntry } from "@/components/tests/Scoreboard";

type Course = { id: string; title: string };
type TestItem = {
  id: string;
  title: string;
  format: "ONLINE" | "WRITTEN";
  durationMinutes: number | null;
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
  type: "SHORT_ANSWER",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  maxMarks: 1,
});

type Tab = "create" | "manage";

export function AdminTestsPanel({
  courses,
  tests,
}: {
  courses: Course[];
  tests: TestItem[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("create");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testFormat, setTestFormat] = useState<"ONLINE" | "WRITTEN">("ONLINE");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [scoreboardTestId, setScoreboardTestId] = useState<string | null>(null);
  const [scoreboardTitle, setScoreboardTitle] = useState("");
  const [scoreboardEntries, setScoreboardEntries] = useState<ScoreboardEntry[]>([]);
  const [scoreboardLoading, setScoreboardLoading] = useState(false);

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
        const previous = options[oIndex];
        options[oIndex] = value;
        return {
          ...q,
          options,
          correctAnswer:
            q.correctAnswer === previous ? value : q.correctAnswer,
        };
      })
    );
  }

  function selectCorrectOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, correctAnswer: q.options[oIndex] };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    for (const q of questions) {
      if (testFormat === "ONLINE" && q.type === "MCQ") {
        const filled = q.options.filter(Boolean);
        if (filled.length < 2) {
          setError("Each MCQ needs at least 2 options.");
          return;
        }
        if (!q.correctAnswer || !filled.includes(q.correctAnswer)) {
          setError("Select the correct MCQ answer using the circle beside an option.");
          return;
        }
      }
    }

    const payload = {
      courseId,
      title,
      description,
      format: testFormat,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
      questions: questions.map((q) => ({
        type: testFormat === "WRITTEN" ? "SHORT_ANSWER" : q.type,
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
    setTestFormat("ONLINE");
    setDurationMinutes("");
    setQuestions([emptyQuestion()]);
    setTab("manage");
    router.refresh();
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
      setMessage("Test deleted");
      if (scoreboardTestId === test.id) {
        setScoreboardTestId(null);
        setScoreboardEntries([]);
      }
      router.refresh();
    } else {
      setError(data.error || "Failed to delete test");
    }
    setDeletingId(null);
  }

  async function loadScoreboard(test: TestItem) {
    if (scoreboardTestId === test.id) {
      setScoreboardTestId(null);
      return;
    }

    setScoreboardTestId(test.id);
    setScoreboardTitle(test.title);
    setScoreboardLoading(true);

    const res = await fetch(`/api/admin/tests/${test.id}/scoreboard`);
    const data = await res.json();
    setScoreboardEntries(data.entries || []);
    setScoreboardLoading(false);
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`rounded-lg py-2.5 text-sm font-semibold transition ${
            tab === "create"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Create test
        </button>
        <button
          type="button"
          onClick={() => setTab("manage")}
          className={`rounded-lg py-2.5 text-sm font-semibold transition ${
            tab === "manage"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Manage tests
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-success">{message}</p> : null}

      {tab === "create" ? (
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
            <Field label="Test type">
              <Select
                value={testFormat}
                onChange={(e) => {
                  const format = e.target.value as "ONLINE" | "WRITTEN";
                  setTestFormat(format);
                  if (format === "WRITTEN") {
                    setDurationMinutes("");
                    setQuestions((prev) =>
                      prev.map((q) => ({ ...q, type: "SHORT_ANSWER" }))
                    );
                  }
                }}
              >
                <option value="ONLINE">Online test (MCQ + short answer in app)</option>
                <option value="WRITTEN">Written test (questions on paper, submit answers)</option>
              </Select>
            </Field>
            {testFormat === "ONLINE" ? (
              <Field label="Time limit (minutes)">
                <Input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="Leave empty for no time limit"
                />
              </Field>
            ) : null}
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
              {testFormat === "WRITTEN" ? (
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-muted">
                  Written questions (manually graded)
                </p>
              ) : (
                <Select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(index, {
                      type: e.target.value as "MCQ" | "SHORT_ANSWER",
                      correctAnswer: "",
                    })
                  }
                >
                  <option value="SHORT_ANSWER">
                    Short Answer (manual grading)
                  </option>
                  <option value="MCQ">Multiple Choice (auto-graded)</option>
                </Select>
              )}
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

              {testFormat === "ONLINE" && q.type === "MCQ" ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Options — tap ○ to mark correct answer
                  </p>
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                        q.correctAnswer === opt && opt !== ""
                          ? "border-primary bg-indigo-50"
                          : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mcq-correct-${index}`}
                        className="h-4 w-4 accent-primary"
                        checked={q.correctAnswer === opt && opt !== ""}
                        onChange={() => selectCorrectOption(index, oi)}
                      />
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(index, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
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

          <Button type="submit" fullWidth>
            Publish test
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          {tests.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">
                No published tests yet. Create one in the Create test tab.
              </p>
            </Card>
          ) : (
            tests.map((t) => (
              <Card key={t.id}>
                <Badge>{t.course.title}</Badge>
                <Badge tone={t.format === "ONLINE" ? "default" : "success"}>
                  {t.format === "ONLINE" ? "Online" : "Written"}
                </Badge>
                <p className="mt-2 font-semibold">{t.title}</p>
                <p className="text-xs text-muted">
                  {t._count.questions} questions · {t._count.attempts} attempts
                  {t.format === "ONLINE" && t.durationMinutes
                    ? ` · ${t.durationMinutes} min timer`
                    : ""}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => loadScoreboard(t)}
                  >
                    {scoreboardTestId === t.id ? "Hide scoreboard" : "Scoreboard"}
                  </Button>
                  <Button
                    variant="danger"
                    className="text-xs"
                    disabled={deletingId === t.id}
                    onClick={() => deleteTest(t)}
                  >
                    {deletingId === t.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </Card>
            ))
          )}

          {scoreboardTestId ? (
            <Scoreboard
              title={`Scoreboard — ${scoreboardTitle}`}
              subtitle="Ranked by score (highest first)"
              entries={scoreboardEntries}
              loading={scoreboardLoading}
              emptyMessage="No student attempts yet for this test."
            />
          ) : null}
        </div>
      )}
    </>
  );
}
