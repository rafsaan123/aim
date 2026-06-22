import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { getAdminUsersPageData } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminUsersPage() {
  const data = toPlain(await getAdminUsersPageData());

  return (
    <>
      <AdminPageHeader title="Users" description="Student accounts and course enrollments." />
      <AdminUsersPanel {...data} />
    </>
  );
}
