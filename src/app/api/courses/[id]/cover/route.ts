import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  COURSE_THEME_PRESETS,
  isAllowedCourseImage,
  MAX_COURSE_IMAGE_BYTES,
  requireCourseCoverAccess,
} from "@/lib/courses";

function toBody(data: Uint8Array | Buffer) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return new Uint8Array(bytes);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const session = await requireCourseCoverAccess(courseId);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { imageData: true, imageMimeType: true },
  });

  if (!course?.imageData || !course.imageMimeType) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(toBody(course.imageData), {
    headers: {
      "Content-Type": course.imageMimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
