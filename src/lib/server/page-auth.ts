import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";

export async function requireStudentPage() {
  const session = await requireSession(Role.STUDENT);
  if (!session) redirect("/login");
  return session;
}

export async function requireAdminPage() {
  const session = await requireSession(Role.ADMIN);
  if (!session) redirect("/login");
  return session;
}
