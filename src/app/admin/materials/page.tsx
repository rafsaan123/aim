import { AdminShell } from "@/components/mobile/AdminShell";
import { AdminMaterialsPanel } from "@/components/admin/AdminMaterialsPanel";
import { getAdminMaterialsPageData } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminMaterialsPage() {
  const data = toPlain(await getAdminMaterialsPageData());

  return (
    <AdminShell title="Study Materials">
      <AdminMaterialsPanel {...data} />
    </AdminShell>
  );
}
