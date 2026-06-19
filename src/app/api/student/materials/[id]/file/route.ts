import { NextResponse } from "next/server";
import {
  canStudentAccessMaterial,
  requireStudentSession,
} from "@/lib/materials";
import { db } from "@/lib/db";

function toBody(data: Uint8Array | Buffer) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return new Uint8Array(bytes);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStudentSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const access = await canStudentAccessMaterial(session.id, id);
  if (!access) {
    return new NextResponse("Not found", { status: 404 });
  }

  const material = await db.studyMaterial.findUnique({
    where: { id },
    select: { fileData: true, mimeType: true },
  });

  if (!material || toBody(material.fileData).byteLength === 0) {
    return new NextResponse("File not found or empty", { status: 404 });
  }

  const body = toBody(material.fileData);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": material.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
