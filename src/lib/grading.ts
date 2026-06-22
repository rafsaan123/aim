import { AttemptStatus, QuestionType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { notifyResultPublished } from "@/lib/notifications";

async function clearAnswerAttachments(attemptId: string) {
  await db.answer.updateMany({
    where: { attemptId },
    data: {
      attachmentData: null,
      attachmentMimeType: null,
      attachmentFileName: null,
    },
  });
}

export async function autoGradeMcqAnswers(attemptId: string) {
  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { name: true, email: true } },
      answers: { include: { question: true } },
      test: {
        include: {
          questions: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!attempt) return null;

  const wasGraded = attempt.status === AttemptStatus.GRADED;

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

  if (status === AttemptStatus.GRADED) {
    await clearAnswerAttachments(attemptId);
  }

  const updated = await db.testAttempt.update({
    where: { id: attemptId },
    data: {
      totalMarks,
      obtainedMarks,
      status,
      gradedAt: status === AttemptStatus.GRADED ? new Date() : null,
    },
  });

  if (!wasGraded && status === AttemptStatus.GRADED) {
    notifyResultPublished({
      studentName: attempt.user.name,
      studentEmail: attempt.user.email,
      courseTitle: attempt.test.course.title,
      testTitle: attempt.test.title,
      obtainedMarks,
      totalMarks,
    });
  }

  return updated;
}
