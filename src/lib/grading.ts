import { AttemptStatus, QuestionType } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function autoGradeMcqAnswers(attemptId: string) {
  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: { include: { question: true } },
      test: { include: { questions: true } },
    },
  });

  if (!attempt) return null;

  let obtainedMarks = 0;
  const totalMarks = attempt.test.questions.reduce(
    (sum, q) => sum + q.maxMarks,
    0
  );

  for (const answer of attempt.answers) {
    if (answer.question.type === QuestionType.MCQ) {
      const isCorrect =
        answer.response.trim().toLowerCase() ===
        (answer.question.correctAnswer || "").trim().toLowerCase();
      const marks = isCorrect ? answer.question.maxMarks : 0;
      obtainedMarks += marks;

      await db.answer.update({
        where: { id: answer.id },
        data: {
          isCorrect,
          marksAwarded: marks,
        },
      });
    }
  }

  const shortAnswerCount = attempt.answers.filter(
    (a) => a.question.type === QuestionType.SHORT_ANSWER
  ).length;

  const allShortGraded = attempt.answers
    .filter((a) => a.question.type === QuestionType.SHORT_ANSWER)
    .every((a) => a.marksAwarded !== null);

  const shortMarks = attempt.answers
    .filter((a) => a.question.type === QuestionType.SHORT_ANSWER)
    .reduce((sum, a) => sum + (a.marksAwarded || 0), 0);

  obtainedMarks += shortMarks;

  const status =
    shortAnswerCount === 0 || allShortGraded
      ? AttemptStatus.GRADED
      : AttemptStatus.SUBMITTED;

  return db.testAttempt.update({
    where: { id: attemptId },
    data: {
      totalMarks,
      obtainedMarks,
      status,
      gradedAt: status === AttemptStatus.GRADED ? new Date() : null,
    },
  });
}
