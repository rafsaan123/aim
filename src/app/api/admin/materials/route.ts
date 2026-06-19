import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = new URL(request.url).searchParams.get("courseId");

  const materials = await db.studyMaterial.findMany({
    where: courseId ? { courseId } : undefined,
    include: { course: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const courses = await db.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return NextResponse.json({ materials, courses });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, title, content } = await request.json();
  if (!courseId || !title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Course, title, and content are required" },
      { status: 400 }
    );
  }

  const material = await db.studyMaterial.create({
    data: {
      courseId,
      title: title.trim(),
      content: content.trim(),
    },
    include: { course: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ material }, { status: 201 });
}
