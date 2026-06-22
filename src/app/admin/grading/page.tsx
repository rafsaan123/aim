import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminGradingPanel } from "@/components/admin/AdminGradingPanel";
import { getAdminGradingAttempts } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminGradingPage() {
  const attempts = toPlain(await getAdminGradingAttempts());

  return (
    <>
      <AdminPageHeader title="Grading" description="Grade written answers and publish results." />
      <AdminGradingPanel attempts={attempts} />
    </>
  );
}
