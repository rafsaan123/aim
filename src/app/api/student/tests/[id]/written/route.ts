import { NextResponse } from "next/server";
import { AttemptStatus, Prisma, Role, TestFormat } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_FILE_BYTES } from "@/lib/materials";

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
    include: {
      course: { select: { title: true } },
      questions: { orderBy: { id: "asc" } },
    },
  });

  if (!test || test.format !== TestFormat.WRITTEN) {
    return NextResponse.json({ error: "Written test not found" }, { status: 404 });
  }

  const enrolled = await db.enrollment.findFirst({
    where: { userId: session.id, courseId: test.courseId },
  });

  if (!enrolled) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const submitted = await db.testAttempt.findFirst({
    where: {
      testId,
      userId: session.id,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
  });

  return NextResponse.json({
    submitted: !!submitted,
    test: {
      id: test.id,
      title: test.title,
      description: test.description,
      format: test.format,
      course: test.course,
      questions: test.questions.map((q) => ({
        id: q.id,
        question: q.question,
        maxMarks: q.maxMarks,
      })),
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: testId } = await params;

  const test = await db.test.findUnique({
    where: { id: testId },
    include: { questions: true },
  });

  if (!test || test.format !== TestFormat.WRITTEN) {
    return NextResponse.json({ error: "Written test not found" }, { status: 404 });
  }

  const enrolled = await db.enrollment.findFirst({
    where: { userId: session.id, courseId: test.courseId },
  });

  if (!enrolled) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const existing = await db.testAttempt.findFirst({
    where: {
      testId,
      userId: session.id,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already submitted this test" },
      { status: 409 }
    );
  }

  const formData = await request.formData();
  const answersJson = formData.get("answers")?.toString();

  if (!answersJson) {
    return NextResponse.json({ error: "Answers are required" }, { status: 400 });
  }

  const answers = JSON.parse(answersJson) as {
    questionId: string;
    response: string;
  }[];

  for (const q of test.questions) {
    const answer = answers.find((a) => a.questionId === q.id);
    const hasText = answer?.response?.trim();
    const file = formData.get(`file_${q.id}`);
    if (!hasText && !(file instanceof File)) {
      return NextResponse.json(
        { error: "Each question needs a written answer or photo upload" },
        { status: 400 }
      );
    }
    if (file instanceof File && file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Each photo must be 4 MB or smaller" },
        { status: 400 }
      );
    }
  }

  const answerCreates = await Promise.all(
    test.questions.map(async (q) => {
      const entry = answers.find((a) => a.questionId === q.id);
      const file = formData.get(`file_${q.id}`);
      let attachmentData: Uint8Array | undefined;
      let attachmentMimeType: string | undefined;
      let attachmentFileName: string | undefined;

      if (file instanceof File && file.size > 0) {
        attachmentData = new Uint8Array(await file.arrayBuffer());
        attachmentMimeType = file.type || "image/jpeg";
        attachmentFileName = file.name;
      }

      return {
        questionId: q.id,
        response: entry?.response?.trim() || "(See attached written answer)",
        ...(attachmentData
          ? {
              attachmentData,
              attachmentMimeType: attachmentMimeType!,
              attachmentFileName: attachmentFileName!,
            }
          : {}),
      };
    })
  );

  const totalMarks = test.questions.reduce((sum, q) => sum + q.maxMarks, 0);

  const attempt = await db.testAttempt.create({
    data: {
      testId,
      userId: session.id,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      totalMarks,
    },
  });

  await db.answer.createMany({
    data: answerCreates.map(
      (answer): Prisma.AnswerCreateManyInput => ({
        attemptId: attempt.id,
        questionId: answer.questionId,
        response: answer.response,
        attachmentData: answer.attachmentData
          ? new Uint8Array(answer.attachmentData)
          : null,
        attachmentMimeType: answer.attachmentMimeType ?? null,
        attachmentFileName: answer.attachmentFileName ?? null,
      })
    ),
  });

  return NextResponse.json({ attempt }, { status: 201 });
}
