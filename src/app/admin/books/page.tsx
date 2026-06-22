import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminBooksPanel } from "@/components/admin/AdminBooksPanel";
import { getAdminBooks } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminBooksPage() {
  const books = toPlain(await getAdminBooks());

  return (
    <>
      <AdminPageHeader
        title="Books"
        description="Manage books for the public website — pricing, stock, and order details."
      />
      <AdminBooksPanel books={books} />
    </>
  );
}
