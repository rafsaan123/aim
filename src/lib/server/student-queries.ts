import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { materialListSelect } from "@/lib/materials";

async function studentId() {
  const session = await requireSession(Role.STUDENT);
  return session?.id ?? null;
}

export async function getStudentMaterials() {
  const userId = await studentId();
  if (!userId) return [];

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  return db.studyMaterial.findMany({
    where: { courseId: { in: courseIds } },
    select: materialListSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentTests() {
  const userId = await studentId();
  if (!userId) return [];

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  return db.test.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentCourses() {
  const userId = await studentId();
  if (!userId) return [];

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: { select: { materials: true, tests: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return enrollments.map((e) => ({
    id: e.course.id,
    title: e.course.title,
    description: e.course.description,
    themeColor: e.course.themeColor,
    hasImage: Boolean(e.course.imageMimeType && e.course.imageFileName),
    enrolledAt: e.enrolledAt,
    _count: e.course._count,
  }));
}

export async function getStudentResults() {
  const userId = await studentId();
  if (!userId) return [];

  return db.testAttempt.findMany({
    where: {
      userId,
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
    include: {
      test: {
        include: { course: { select: { title: true } } },
      },
      answers: { include: { question: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}
