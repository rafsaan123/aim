import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminSuccessStoriesPanel } from "@/components/admin/AdminSuccessStoriesPanel";
import { getAdminSuccessStories } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminSuccessStoriesPage() {
  const stories = toPlain(await getAdminSuccessStories());

  return (
    <>
      <AdminPageHeader
        title="Success Stories"
        description="Add student success stories with profile photos for the public site."
      />
      <AdminSuccessStoriesPanel stories={stories} />
    </>
  );
}
