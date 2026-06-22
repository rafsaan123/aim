import { NextResponse } from "next/server";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildScoreboardEntries } from "@/lib/scoreboard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: testId } = await params;

  const test = await db.test.findUnique({
    where: { id: testId },
    include: { course: { select: { title: true } } },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const attempts = await db.testAttempt.findMany({
    where: {
      testId,
      status: { in: [AttemptStatus.GRADED, AttemptStatus.SUBMITTED] },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const { entries } = buildScoreboardEntries(attempts);

  return NextResponse.json({
    test: {
      id: test.id,
      title: test.title,
      course: test.course.title,
    },
    entries,
  });
}
