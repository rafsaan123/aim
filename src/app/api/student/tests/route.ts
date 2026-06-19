import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoGradeMcqAnswers } from "@/lib/grading";
import { isTestExpired } from "@/lib/test-timer";

export async function GET() {
  const session = await requireSession(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.id },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  const tests = await db.test.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: session.id },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tests });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId, attemptId, answers, autoSubmitted } = await request.json();

  if (!testId || !attemptId || !answers?.length) {
    return NextResponse.json(
      { error: "Test ID, attempt ID, and answers are required" },
      { status: 400 }
    );
  }

  const test = await db.test.findUnique({
    where: { id: testId },
    include: { questions: true },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
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

  const attempt = await db.testAttempt.findFirst({
    where: {
      id: attemptId,
      testId,
      userId: session.id,
      status: AttemptStatus.IN_PROGRESS,
    },
  });

  if (!attempt) {
    return NextResponse.json(
      { error: "No active test session found" },
      { status: 404 }
    );
  }

  const timedOut = isTestExpired(attempt.startedAt, test.durationMinutes);
  if (timedOut && !autoSubmitted) {
    return NextResponse.json(
      { error: "Time is up. Your test was auto-submitted." },
      { status: 409 }
    );
  }

  if (!autoSubmitted) {
    const missing = test.questions.filter((q) => {
      const answer = answers.find(
        (a: { questionId: string }) => a.questionId === q.id
      );
      return !answer?.response?.trim();
    });
    if (missing.length) {
      return NextResponse.json(
        { error: "Please answer all questions before submitting." },
        { status: 400 }
      );
    }
  }

  await db.answer.deleteMany({ where: { attemptId: attempt.id } });

  const updated = await db.testAttempt.update({
    where: { id: attempt.id },
    data: {
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      answers: {
        create: answers.map(
          (a: { questionId: string; response: string }) => ({
            questionId: a.questionId,
            response: (a.response || "").trim(),
          })
        ),
      },
    },
    include: { answers: { include: { question: true } } },
  });

  const graded = await autoGradeMcqAnswers(updated.id);
  return NextResponse.json({ attempt: graded }, { status: 201 });
}
