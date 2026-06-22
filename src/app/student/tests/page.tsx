import Link from "next/link";
import { Clock } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { getStudentTests } from "@/lib/server/student-queries";

export default async function StudentTestsPage() {
  const tests = await getStudentTests();

  return (
    <MobileShell title="Tests" subtitle="Online and written tests for your courses">
      {tests.length === 0 ? (
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
                <div className="flex flex-wrap gap-2">
                  <Badge>{test.course.title}</Badge>
                  <Badge tone={test.format === "ONLINE" ? "default" : "success"}>
                    {test.format === "ONLINE" ? "Online" : "Written"}
                  </Badge>
                </div>
                <h3 className="mt-2 font-semibold">{test.title}</h3>
                {test.description ? (
                  <p className="mt-1 text-sm text-muted">{test.description}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  <span>{test._count.questions} question(s)</span>
                  {test.format === "ONLINE" && test.durationMinutes ? (
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
                      {inProgress
                        ? test.format === "WRITTEN"
                          ? "Continue submission"
                          : "Continue test"
                        : test.format === "WRITTEN"
                          ? "View questions & submit"
                          : "Start test"}
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
