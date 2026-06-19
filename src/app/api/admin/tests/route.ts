import { NextResponse } from "next/server";
import { QuestionType, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tests, courses] = await Promise.all([
    db.test.findMany({
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return NextResponse.json({ tests, courses });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, title, description, durationMinutes, questions } =
    await request.json();

  if (!courseId || !title?.trim() || !questions?.length) {
    return NextResponse.json(
      { error: "Course, title, and at least one question are required" },
      { status: 400 }
    );
  }

  const test = await db.test.create({
    data: {
      courseId,
      title: title.trim(),
      description: description?.trim() || null,
      durationMinutes:
        durationMinutes && durationMinutes > 0
          ? Math.floor(durationMinutes)
          : null,
      questions: {
        create: questions.map(
          (q: {
            type: QuestionType;
            question: string;
            options?: string[];
            correctAnswer?: string;
            maxMarks?: number;
          }) => ({
            type: q.type,
            question: q.question.trim(),
            options:
              q.type === QuestionType.MCQ && q.options
                ? JSON.stringify(q.options)
                : null,
            correctAnswer:
              q.type === QuestionType.MCQ ? q.correctAnswer?.trim() : null,
            maxMarks: q.maxMarks || 1,
          })
        ),
      },
    },
    include: {
      course: { select: { id: true, title: true } },
      questions: true,
    },
  });

  return NextResponse.json({ test }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId } = await request.json();
  if (!testId) {
    return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
  }

  const test = await db.test.findUnique({
    where: { id: testId },
    include: { _count: { select: { attempts: true } } },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  await db.test.delete({ where: { id: testId } });

  return NextResponse.json({
    success: true,
    deletedAttempts: test._count.attempts,
  });
}
