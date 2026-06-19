import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: testId } = await params;

  const test = await db.test.findUnique({
    where: { id: testId },
    select: { id: true, title: true, courseId: true, course: { select: { title: true } } },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const enrolled = await db.enrollment.findFirst({
    where: { userId: session.id, courseId: test.courseId },
  });

  if (!enrolled) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const attempts = await db.testAttempt.findMany({
    where: {
      testId,
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: [
      { obtainedMarks: "desc" },
      { submittedAt: "asc" },
    ],
  });

  const entries = attempts.map((attempt, index) => ({
    rank: index + 1,
    studentId: attempt.user.id,
    name: attempt.user.name,
    obtainedMarks: attempt.obtainedMarks,
    totalMarks: attempt.totalMarks,
    status: attempt.status,
    isCurrentUser: attempt.user.id === session.id,
    percentage:
      attempt.obtainedMarks !== null &&
      attempt.totalMarks &&
      attempt.totalMarks > 0
        ? Math.round((attempt.obtainedMarks / attempt.totalMarks) * 100)
        : null,
  }));

  const myEntry = entries.find((e) => e.isCurrentUser) || null;

  return NextResponse.json({
    test: {
      id: test.id,
      title: test.title,
      course: test.course.title,
    },
    entries,
    myRank: myEntry?.rank ?? null,
  });
}
