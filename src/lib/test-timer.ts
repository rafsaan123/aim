export function getTestExpiresAt(
  startedAt: Date,
  durationMinutes: number | null | undefined
): Date | null {
  if (!durationMinutes || durationMinutes <= 0) return null;
  return new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
}

export function isTestExpired(
  startedAt: Date | null | undefined,
  durationMinutes: number | null | undefined
): boolean {
  if (!startedAt || !durationMinutes || durationMinutes <= 0) return false;
  const expiresAt = getTestExpiresAt(startedAt, durationMinutes);
  return expiresAt ? new Date() > expiresAt : false;
}

export function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
