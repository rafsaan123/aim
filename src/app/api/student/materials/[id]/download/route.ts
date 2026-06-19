import { NextResponse } from "next/server";
import {
  canStudentAccessMaterial,
  requireStudentSession,
} from "@/lib/materials";
import {
  watermarkMaterialFile,
  watermarkedFileName,
} from "@/lib/watermark";
import { db } from "@/lib/db";

function toBuffer(data: Uint8Array | Buffer) {
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
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
    select: {
      fileData: true,
      mimeType: true,
      fileName: true,
      fileType: true,
    },
  });

  if (!material) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileBuffer = toBuffer(material.fileData);
  if (fileBuffer.length === 0) {
    return new NextResponse("File not found or empty", { status: 404 });
  }

  const watermarkText = `${session.name} · ${session.email}`;
  const watermarked = await watermarkMaterialFile(
    material.fileType,
    fileBuffer,
    watermarkText
  );

  const body = Buffer.isBuffer(watermarked)
    ? watermarked
    : Buffer.from(watermarked);
  const downloadName = watermarkedFileName(material.fileName);

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": material.mimeType,
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
