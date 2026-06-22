import { AdminShell } from "@/components/mobile/AdminShell";
import { AdminCoursesPanel } from "@/components/admin/AdminCoursesPanel";
import { getAdminCourses } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminCoursesPage() {
  const courses = toPlain(await getAdminCourses());

  return (
    <AdminShell title="Course Manage">
      <AdminCoursesPanel courses={courses} />
    </AdminShell>
  );
}
