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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const access = await canStudentAccessMaterial(session.id, id);
  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const material = await db.studyMaterial.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      fileName: true,
      fileType: true,
      mimeType: true,
      course: { select: { title: true } },
    },
  });

  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ material });
}
