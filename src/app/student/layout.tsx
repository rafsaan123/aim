import type { ReactNode } from "react";
import { requireStudentPage } from "@/lib/server/page-auth";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireStudentPage();
  return children;
}
