import { MaterialFileType, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_TYPES: Record<
  MaterialFileType,
  { mimeTypes: string[]; extensions: string[] }
> = {
  PDF: {
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
  },
  IMAGE: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
};

export const MAX_FILE_BYTES = 4 * 1024 * 1024;

export const materialListSelect = {
  id: true,
  title: true,
  description: true,
  fileName: true,
  fileType: true,
  mimeType: true,
  createdAt: true,
  course: { select: { id: true, title: true } },
} as const;

export function detectFileType(
  mimeType: string,
  fileName: string
): MaterialFileType | null {
  const lower = fileName.toLowerCase();

  if (
    ALLOWED_TYPES.PDF.mimeTypes.includes(mimeType) ||
    lower.endsWith(".pdf")
  ) {
    return MaterialFileType.PDF;
  }

  if (
    ALLOWED_TYPES.IMAGE.mimeTypes.includes(mimeType) ||
    ALLOWED_TYPES.IMAGE.extensions.some((ext) => lower.endsWith(ext))
  ) {
    return MaterialFileType.IMAGE;
  }

  return null;
}

export function isAllowedMaterialFile(mimeType: string, fileName: string) {
  return detectFileType(mimeType, fileName) !== null;
}

export async function canStudentAccessMaterial(
  userId: string,
  materialId: string
) {
  const material = await db.studyMaterial.findUnique({
    where: { id: materialId },
    select: { id: true, courseId: true },
  });

  if (!material) return null;

  const enrollment = await db.enrollment.findFirst({
    where: { userId, courseId: material.courseId },
  });

  if (!enrollment) return null;

  return material;
}

export async function requireAdminSession() {
  return requireSession(Role.ADMIN);
}

export async function requireStudentSession() {
  return requireSession(Role.STUDENT);
}
