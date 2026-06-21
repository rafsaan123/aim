import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireSession(Role.STUDENT);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await db.enrollment.findMany({
    where: { userId: session.id },
    include: {
      course: {
        include: {
          _count: {
            select: { materials: true, tests: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return NextResponse.json({
    courses: courses.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      themeColor: e.course.themeColor,
      hasImage: Boolean(e.course.imageMimeType && e.course.imageFileName),
      enrolledAt: e.enrolledAt,
      _count: e.course._count,
    })),
  });
}
