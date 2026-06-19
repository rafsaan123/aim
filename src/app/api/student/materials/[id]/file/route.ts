import { NextResponse } from "next/server";
import {
  canStudentAccessMaterial,
  requireStudentSession,
} from "@/lib/materials";
import { db } from "@/lib/db";

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
    select: { fileData: true, mimeType: true, fileName: true },
  });

  if (!material) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(material.fileData, {
    status: 200,
    headers: {
      "Content-Type": material.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
