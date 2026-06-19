import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoGradeMcqAnswers } from "@/lib/grading";

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
        orderBy: { submittedAt: "desc" },
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

  const { testId, answers } = await request.json();

  if (!testId || !answers?.length) {
    return NextResponse.json(
      { error: "Test ID and answers are required" },
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

  const existingAttempt = await db.testAttempt.findFirst({
    where: {
      testId,
      userId: session.id,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
  });

  if (existingAttempt) {
    return NextResponse.json(
      { error: "You have already submitted this test" },
      { status: 409 }
    );
  }

  const attempt = await db.testAttempt.create({
    data: {
      testId,
      userId: session.id,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      answers: {
        create: answers.map(
          (a: { questionId: string; response: string }) => ({
            questionId: a.questionId,
            response: a.response.trim(),
          })
        ),
      },
    },
    include: { answers: { include: { question: true } } },
  });

  const graded = await autoGradeMcqAnswers(attempt.id);
  return NextResponse.json({ attempt: graded }, { status: 201 });
}
