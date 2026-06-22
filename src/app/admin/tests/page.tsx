import { AdminShell } from "@/components/mobile/AdminShell";
import { AdminTestsPanel } from "@/components/admin/AdminTestsPanel";
import { getAdminTestsPageData } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminTestsPage() {
  const data = toPlain(await getAdminTestsPageData());

  return (
    <AdminShell title="Tests">
      <AdminTestsPanel {...data} />
    </AdminShell>
  );
}
