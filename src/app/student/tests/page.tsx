"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { Clock } from "lucide-react";

type TestItem = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  course: { id: string; title: string };
  _count: { questions: number };
  attempts: {
    status: string;
    obtainedMarks: number | null;
    totalMarks: number | null;
  }[];
};

export default function StudentTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell title="Tests" subtitle="Take timed tests for your courses">
      {loading ? (
        <p className="text-center text-sm text-muted">Loading tests...</p>
      ) : tests.length === 0 ? (
        <EmptyState
          title="No tests available"
          description="Tests will show up here when your admin creates them for your courses."
        />
      ) : (
        <div className="space-y-3">
          {tests.map((test) => {
            const attempt = test.attempts[0];
            const submitted =
              attempt?.status === "SUBMITTED" || attempt?.status === "GRADED";
            const inProgress = attempt?.status === "IN_PROGRESS";

            return (
              <Card key={test.id}>
                <Badge>{test.course.title}</Badge>
                <h3 className="mt-2 font-semibold">{test.title}</h3>
                {test.description ? (
                  <p className="mt-1 text-sm text-muted">{test.description}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  <span>{test._count.questions} question(s)</span>
                  {test.durationMinutes ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Clock className="h-3 w-3" />
                      {test.durationMinutes} min
                    </span>
                  ) : null}
                </div>

                {submitted ? (
                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    {attempt.status === "GRADED" ? (
                      <span className="font-medium text-success">
                        Score: {attempt.obtainedMarks}/{attempt.totalMarks}
                      </span>
                    ) : (
                      <span className="font-medium text-warning">
                        Submitted — awaiting manual grading
                      </span>
                    )}
                  </div>
                ) : (
                  <Link href={`/student/tests/${test.id}`} className="mt-3 block">
                    <Button fullWidth>
                      {inProgress ? "Continue test" : "Start test"}
                    </Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </MobileShell>
  );
}
