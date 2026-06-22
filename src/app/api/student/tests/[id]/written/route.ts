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

  const answerSheet = formData.get("answerSheet");
  const hasPhoto = answerSheet instanceof File && answerSheet.size > 0;

  if (hasPhoto && answerSheet.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Answer sheet photo must be 4 MB or smaller" },
      { status: 400 }
    );
  }

  const allTyped = test.questions.every((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    return !!answer?.response?.trim();
  });

  if (!hasPhoto && !allTyped) {
    return NextResponse.json(
      {
        error:
          "Upload one photo of your answer sheet or type an answer for every question",
      },
      { status: 400 }
    );
  }

  let sheetData: Uint8Array | undefined;
  let sheetMimeType: string | undefined;
  let sheetFileName: string | undefined;

  if (hasPhoto) {
    sheetData = new Uint8Array(await answerSheet.arrayBuffer());
    sheetMimeType = answerSheet.type || "image/jpeg";
    sheetFileName = answerSheet.name;
  }

  const answerCreates = test.questions.map((q, index) => {
    const entry = answers.find((a) => a.questionId === q.id);
    const typed = entry?.response?.trim();
    const attachSheet = hasPhoto && index === 0;

    return {
      questionId: q.id,
      response: typed || (hasPhoto ? "(See answer sheet photo)" : ""),
      ...(attachSheet && sheetData
        ? {
            attachmentData: sheetData,
            attachmentMimeType: sheetMimeType!,
            attachmentFileName: sheetFileName!,
          }
        : {}),
    };
  });

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
