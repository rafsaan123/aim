import { AttemptStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function finalizeWrittenAttempt(attemptId: string) {
  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: { test: { include: { questions: true } } },
  });

  if (!attempt) return null;

  const totalMarks = attempt.test.questions.reduce(
    (sum, q) => sum + q.maxMarks,
    0
  );

  return db.testAttempt.update({
    where: { id: attemptId },
    data: {
      totalMarks,
      obtainedMarks: null,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });
}
