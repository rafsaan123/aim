import { NextResponse } from "next/server";
import { AttemptStatus, QuestionType, Role, TestFormat } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoGradeMcqAnswers } from "@/lib/grading";

export async function GET() {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attempts = await db.testAttempt.findMany({
    where: {
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      test: {
        include: {
          course: { select: { title: true } },
          questions: true,
        },
      },
      answers: { include: { question: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ attempts });
}

export async function PATCH(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId, grades } = await request.json();

  if (!attemptId || !grades?.length) {
    return NextResponse.json(
      { error: "Attempt ID and grades are required" },
      { status: 400 }
    );
  }

  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: { include: { question: true } },
      test: { select: { format: true } },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  for (const grade of grades as {
    answerId: string;
    marksAwarded: number;
    feedback?: string;
  }[]) {
    const answer = attempt.answers.find((a) => a.id === grade.answerId);
    if (!answer) continue;

    const manualGrade =
      answer.question.type === QuestionType.SHORT_ANSWER ||
      attempt.test.format === TestFormat.WRITTEN;

    if (!manualGrade) continue;

    await db.answer.update({
      where: { id: grade.answerId },
      data: {
        marksAwarded: Math.max(0, Math.min(grade.marksAwarded, answer.question.maxMarks)),
        feedback: grade.feedback?.trim() || null,
        isCorrect: grade.marksAwarded >= answer.question.maxMarks,
      },
    });
  }

  const updated = await autoGradeMcqAnswers(attemptId);
  return NextResponse.json({ attempt: updated });
}

