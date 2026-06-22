import type { ReactNode } from "react";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";
import { requireAdminPage } from "@/lib/server/page-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
