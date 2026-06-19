import "dotenv/config";
import bcrypt from "bcryptjs";
import { QuestionType, Role } from "../src/generated/prisma/client";
import { createPrismaClient } from "../src/lib/create-prisma";

const db = createPrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@aim.com" },
    update: {},
    create: {
      email: "admin@aim.com",
      name: "AIM Admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const student = await db.user.upsert({
    where: { email: "student@aim.com" },
    update: {},
    create: {
      email: "student@aim.com",
      name: "Demo Student",
      password: studentPassword,
      role: Role.STUDENT,
    },
  });

  const course = await db.course.upsert({
    where: { id: "demo-course" },
    update: {},
    create: {
      id: "demo-course",
      title: "Physics Fundamentals",
      description: "Introduction to mechanics, waves, and thermodynamics.",
    },
  });

  await db.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: course.id },
    },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });

  const existingMaterial = await db.studyMaterial.findFirst({
    where: { courseId: course.id, title: "Newton's Laws Summary" },
  });

  if (!existingMaterial) {
    await db.studyMaterial.create({
      data: {
        courseId: course.id,
        title: "Newton's Laws Summary",
        content:
          "1. First Law: An object remains at rest or in uniform motion unless acted upon by a net force.\n\n2. Second Law: F = ma\n\n3. Third Law: For every action, there is an equal and opposite reaction.",
      },
    });
  }

  const existingTest = await db.test.findFirst({
    where: { courseId: course.id, title: "Physics Weekly Test 1" },
  });

  if (!existingTest) {
    await db.test.create({
      data: {
        courseId: course.id,
        title: "Physics Weekly Test 1",
        description: "Mixed MCQ and short-answer questions.",
        questions: {
          create: [
            {
              type: QuestionType.MCQ,
              question: "What is the SI unit of force?",
              options: JSON.stringify(["Newton", "Joule", "Watt", "Pascal"]),
              correctAnswer: "Newton",
              maxMarks: 2,
            },
            {
              type: QuestionType.MCQ,
              question: "Which law states F = ma?",
              options: JSON.stringify([
                "First Law",
                "Second Law",
                "Third Law",
                "Law of Gravitation",
              ]),
              correctAnswer: "Second Law",
              maxMarks: 2,
            },
            {
              type: QuestionType.SHORT_ANSWER,
              question: "Explain Newton's Third Law with an example.",
              maxMarks: 6,
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete:");
  console.log("  Admin: admin@aim.com / admin123");
  console.log("  Student: student@aim.com / student123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
