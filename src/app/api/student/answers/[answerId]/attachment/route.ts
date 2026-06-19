import { NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/materials";
import { db } from "@/lib/db";

function toBody(data: Uint8Array | Buffer) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return new Uint8Array(bytes);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ answerId: string }> }
) {
  const session = await requireStudentSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { answerId } = await params;

  const answer = await db.answer.findUnique({
    where: { id: answerId },
    include: {
      attempt: { select: { userId: true, testId: true, status: true } },
    },
  });

  if (
    !answer?.attachmentData ||
    !answer.attachmentMimeType ||
    answer.attempt.status === "GRADED"
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (answer.attempt.userId !== session.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(toBody(answer.attachmentData), {
    headers: {
      "Content-Type": answer.attachmentMimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
    },
  });
}
