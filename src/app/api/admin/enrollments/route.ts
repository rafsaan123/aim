import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [students, courses, enrollments] = await Promise.all([
    db.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    db.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.enrollment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolledAt: "desc" },
    }),
  ]);

  return NextResponse.json({ students, courses, enrollments });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, courseId } = await request.json();
  if (!userId || !courseId) {
    return NextResponse.json(
      { error: "Student and course are required" },
      { status: 400 }
    );
  }

  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ enrollment }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json(
      { error: "Enrollment ID is required" },
      { status: 400 }
    );
  }

  const enrollment = await db.enrollment.findUnique({ where: { id } });
  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  await db.enrollment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
