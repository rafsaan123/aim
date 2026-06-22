export type ScoreboardAttempt = {
  user: { id: string; name: string; email?: string };
  obtainedMarks: number | null;
  totalMarks: number | null;
  status: string;
  submittedAt: Date | null;
};

export type BuiltScoreboardEntry = {
  rank: number | null;
  studentId: string;
  name: string;
  email?: string;
  obtainedMarks: number | null;
  totalMarks: number | null;
  status: string;
  percentage: number | null;
  isCurrentUser: boolean;
};

function percentage(obtained: number | null, total: number | null) {
  if (obtained === null || !total || total <= 0) return null;
  return Math.round((obtained / total) * 100);
}

function toEntry(
  attempt: ScoreboardAttempt,
  rank: number | null,
  currentUserId?: string
): BuiltScoreboardEntry {
  return {
    rank,
    studentId: attempt.user.id,
    name: attempt.user.name,
    email: attempt.user.email,
    obtainedMarks: attempt.obtainedMarks,
    totalMarks: attempt.totalMarks,
    status: attempt.status,
    isCurrentUser: currentUserId ? attempt.user.id === currentUserId : false,
    percentage: percentage(attempt.obtainedMarks, attempt.totalMarks),
  };
}

export function buildScoreboardEntries(
  attempts: ScoreboardAttempt[],
  currentUserId?: string
) {
  const graded = attempts
    .filter((a) => a.status === "GRADED")
    .sort((a, b) => {
      const marksDiff = (b.obtainedMarks ?? 0) - (a.obtainedMarks ?? 0);
      if (marksDiff !== 0) return marksDiff;
      return (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0);
    });

  const pending = attempts
    .filter((a) => a.status === "SUBMITTED")
    .sort((a, b) => (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0));

  const entries = [
    ...graded.map((attempt, index) => toEntry(attempt, index + 1, currentUserId)),
    ...pending.map((attempt) => toEntry(attempt, null, currentUserId)),
  ];

  const myEntry = entries.find((e) => e.isCurrentUser) ?? null;

  return {
    entries,
    myRank: myEntry?.rank ?? null,
    myStatus: myEntry?.status ?? null,
  };
}
