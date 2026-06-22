import { NextResponse } from "next/server";
import { MaterialFileType } from "@/generated/prisma/client";
import {
  detectFileType,
  isAllowedMaterialFile,
  MAX_FILE_BYTES,
  materialListSelect,
  requireAdminSession,
} from "@/lib/materials";
import { db } from "@/lib/db";
import { notifyNewMaterial } from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = new URL(request.url).searchParams.get("courseId");

  const materials = await db.studyMaterial.findMany({
    where: courseId ? { courseId } : undefined,
    select: materialListSelect,
    orderBy: { createdAt: "desc" },
  });

  const courses = await db.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return NextResponse.json({ materials, courses });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const courseId = formData.get("courseId")?.toString();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const file = formData.get("file");

  if (!courseId || !title?.trim() || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Course, title, and PDF/image file are required" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File must be 4 MB or smaller" },
      { status: 400 }
    );
  }

  const mimeType = file.type || "application/octet-stream";
  const fileType = detectFileType(mimeType, file.name);

  if (!fileType || !isAllowedMaterialFile(mimeType, file.name)) {
    return NextResponse.json(
      { error: "Only PDF, JPG, PNG, and WEBP files are allowed" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const material = await db.studyMaterial.create({
    data: {
      courseId,
      title: title.trim(),
      description: description?.trim() || null,
      fileName: file.name,
      fileType,
      mimeType: fileType === MaterialFileType.PDF ? "application/pdf" : mimeType,
      fileData: buffer,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileName: true,
      fileType: true,
      mimeType: true,
      createdAt: true,
      course: { select: { id: true, title: true } },
    },
  });

  notifyNewMaterial({
    courseId: material.course.id,
    courseTitle: material.course.title,
    materialTitle: material.title,
  });

  return NextResponse.json({ material }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
  }

  await db.studyMaterial.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
