import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await requireSession(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testId = new URL(request.url).searchParams.get("testId");

  if (testId) {
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

    const sanitized = {
      ...test,
      questions: test.questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options ? JSON.parse(q.options) : null,
        maxMarks: q.maxMarks,
      })),
    };

    return NextResponse.json({ test: sanitized });
  }

  const results = await db.testAttempt.findMany({
    where: {
      userId: session.id,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
    include: {
      test: {
        include: { course: { select: { title: true } } },
      },
      answers: { include: { question: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ results });
}
