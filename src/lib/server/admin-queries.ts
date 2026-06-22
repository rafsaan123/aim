import { AttemptStatus, Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { materialListSelect } from "@/lib/materials";

function courseSummary(course: {
  id: string;
  title: string;
  description: string | null;
  themeColor: string;
  imageFileName: string | null;
  imageMimeType: string | null;
  createdAt: Date;
  _count: { enrollments: number; materials: number; tests: number };
}) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    themeColor: course.themeColor,
    hasImage: Boolean(course.imageMimeType && course.imageFileName),
    createdAt: course.createdAt,
    _count: course._count,
  };
}

export async function getAdminUsersPageData() {
  const [students, courses, enrollments, users] = await Promise.all([
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
    db.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        enrollments: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
    }),
  ]);

  return { students, courses, enrollments, users };
}

export async function getAdminCourses() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, materials: true, tests: true } },
    },
  });

  return courses.map(courseSummary);
}

export async function getAdminMaterialsPageData() {
  const [materials, courses] = await Promise.all([
    db.studyMaterial.findMany({
      select: materialListSelect,
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return { materials, courses };
}

export async function getAdminTestsPageData() {
  const [tests, courses] = await Promise.all([
    db.test.findMany({
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return { tests, courses };
}

export async function getAdminGradingAttempts() {
  return db.testAttempt.findMany({
    where: {
      status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      test: {
        include: {
          course: { select: { title: true } },
          questions: true,
        },
      },
      answers: { include: { question: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}
