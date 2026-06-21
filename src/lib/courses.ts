import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export { COURSE_THEME_PRESETS, getCourseTheme } from "@/lib/course-themes";

export const MAX_COURSE_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isAllowedCourseImage(mimeType: string, fileName: string) {
  const lower = fileName.toLowerCase();
  return (
    ALLOWED_IMAGE_TYPES.includes(mimeType) ||
    [".jpg", ".jpeg", ".png", ".webp"].some((ext) => lower.endsWith(ext))
  );
}

export async function canAccessCourseCover(userId: string, role: Role, courseId: string) {
  if (role === Role.ADMIN) return true;

  const enrollment = await db.enrollment.findFirst({
    where: { userId, courseId },
    select: { id: true },
  });

  return Boolean(enrollment);
}

export async function requireCourseCoverAccess(courseId: string) {
  const session = await requireSession();
  if (!session) return null;

  const allowed = await canAccessCourseCover(session.id, session.role, courseId);
  if (!allowed) return null;

  return session;
}
