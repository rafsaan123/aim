import { NextResponse } from "next/server";
import {
  canStudentAccessMaterial,
  materialListSelect,
  requireStudentSession,
} from "@/lib/materials";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.id },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  const materials = await db.studyMaterial.findMany({
    where: { courseId: { in: courseIds } },
    select: materialListSelect,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ materials });
}
