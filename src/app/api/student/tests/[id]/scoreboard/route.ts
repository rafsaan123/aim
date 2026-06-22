import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildScoreboardEntries } from "@/lib/scoreboard";

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
  });

  const { entries, myRank, myStatus } = buildScoreboardEntries(attempts, session.id);

  return NextResponse.json({
    test: {
      id: test.id,
      title: test.title,
      course: test.course.title,
    },
    entries,
    myRank,
    myStatus,
  });
}
