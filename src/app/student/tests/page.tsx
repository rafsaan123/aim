import Link from "next/link";
import { Clock } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { CourseFilterBanner } from "@/components/student/CourseFilterBanner";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { getStudentTests } from "@/lib/server/student-queries";

type Props = { searchParams: Promise<{ course?: string }> };

export default async function StudentTestsPage({ searchParams }: Props) {
  const { course: courseId } = await searchParams;
  const allTests = await getStudentTests();
  const tests = courseId
    ? allTests.filter((t) => t.course.id === courseId)
    : allTests;
  const filterTitle = courseId
    ? allTests.find((t) => t.course.id === courseId)?.course.title
    : null;

  return (
    <MobileShell title="Tests">
      {filterTitle ? (
        <CourseFilterBanner courseTitle={filterTitle} clearHref="/student/tests" />
      ) : null}

      {tests.length === 0 ? (
        <EmptyState
          title="No tests"
          description={
            courseId ? "No tests for this course yet." : "Tests will appear here when available."
          }
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
                  {!courseId ? <Badge>{test.course.title}</Badge> : null}
                  <Badge tone={test.format === "ONLINE" ? "default" : "success"}>
                    {test.format === "ONLINE" ? "Online" : "Written"}
                  </Badge>
                </div>
                <h3 className={`font-semibold ${!courseId ? "mt-2" : "mt-1"}`}>
                  {test.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  <span>{test._count.questions} questions</span>
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
                        {attempt.obtainedMarks}/{attempt.totalMarks}
                      </span>
                    ) : (
                      <span className="font-medium text-warning">Awaiting grading</span>
                    )}
                  </div>
                ) : (
                  <Link href={`/student/tests/${test.id}`} className="mt-3 block">
                    <Button fullWidth>
                      {inProgress
                        ? "Continue"
                        : test.format === "WRITTEN"
                          ? "Submit answers"
                          : "Start"}
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
