import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

function toBody(data: Uint8Array | Buffer) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return new Uint8Array(bytes);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ answerId: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { answerId } = await params;

  const answer = await db.answer.findUnique({
    where: { id: answerId },
    select: {
      attachmentData: true,
      attachmentMimeType: true,
      attempt: { select: { status: true } },
    },
  });

  if (
    !answer?.attachmentData ||
    !answer.attachmentMimeType ||
    answer.attempt.status === "GRADED"
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(toBody(answer.attachmentData), {
    headers: {
      "Content-Type": answer.attachmentMimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
    },
  });
}
