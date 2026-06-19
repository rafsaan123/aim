import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTestExpiresAt, isTestExpired } from "@/lib/test-timer";

export async function POST(
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
    include: {
      course: { select: { title: true } },
      questions: { orderBy: { id: "asc" } },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  if (test.format === "WRITTEN") {
    return NextResponse.json(
      { error: "This is a written test. Use the written submission flow." },
      { status: 400 }
    );
  }

  const enrolled = await db.enrollment.findFirst({
    where: { userId: session.id, courseId: test.courseId },
  });

  if (!enrolled) {
    return NextResponse.json(
      { error: "You are not enrolled in this course" },
      { status: 403 }
    );
  }

  const completed = await db.testAttempt.findFirst({
    where: {
      testId,
      userId: session.id,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
  });

  if (completed) {
    return NextResponse.json(
      { error: "You have already submitted this test" },
      { status: 409 }
    );
  }

  let attempt = await db.testAttempt.findFirst({
    where: {
      testId,
      userId: session.id,
      status: AttemptStatus.IN_PROGRESS,
    },
  });

  if (!attempt) {
    attempt = await db.testAttempt.create({
      data: {
        testId,
        userId: session.id,
        status: AttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  } else if (!attempt.startedAt) {
    attempt = await db.testAttempt.update({
      where: { id: attempt.id },
      data: { startedAt: new Date() },
    });
  }

  const expired = isTestExpired(attempt.startedAt, test.durationMinutes);
  const expiresAt = attempt.startedAt
    ? getTestExpiresAt(attempt.startedAt, test.durationMinutes)
    : null;

  return NextResponse.json({
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    expiresAt,
    expired,
    durationMinutes: test.durationMinutes,
    test: {
      id: test.id,
      title: test.title,
      description: test.description,
      durationMinutes: test.durationMinutes,
      course: test.course,
      questions: test.questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options ? JSON.parse(q.options) : null,
        maxMarks: q.maxMarks,
      })),
    },
  });
}
