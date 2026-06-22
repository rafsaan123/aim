import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/server/page-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return children;
}
