import { AdminShell } from "@/components/mobile/AdminShell";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { getAdminUsersPageData } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminUsersPage() {
  const data = toPlain(await getAdminUsersPageData());

  return (
    <AdminShell title="User Manage">
      <AdminUsersPanel {...data} />
    </AdminShell>
  );
}
