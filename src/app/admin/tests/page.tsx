import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminTestsPanel } from "@/components/admin/AdminTestsPanel";
import { getAdminTestsPageData } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminTestsPage() {
  const data = toPlain(await getAdminTestsPageData());

  return (
    <>
      <AdminPageHeader title="Tests" description="Online and written tests for courses." />
      <AdminTestsPanel {...data} />
    </>
  );
}
