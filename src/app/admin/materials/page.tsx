import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminMaterialsPanel } from "@/components/admin/AdminMaterialsPanel";
import { getAdminMaterialsPageData } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminMaterialsPage() {
  const data = toPlain(await getAdminMaterialsPageData());

  return (
    <>
      <AdminPageHeader title="Study Materials" description="PDFs and images for enrolled courses." />
      <AdminMaterialsPanel {...data} />
    </>
  );
}
