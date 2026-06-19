export const SESSION_COOKIE = "aim_session";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "aim-coaching-dev-secret-change-in-production"
);
