import type { ComponentProps } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { AdminGradingPanel } from "@/components/admin/AdminGradingPanel";
import { getAdminGradingAttempts } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminGradingPage() {
  const attempts = toPlain(await getAdminGradingAttempts());

  return (
    <AdminShell title="Grade Tests">
      <AdminGradingPanel attempts={attempts} />
    </AdminShell>
  );
}
