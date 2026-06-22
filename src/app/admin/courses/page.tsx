import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { AdminCoursesPanel } from "@/components/admin/AdminCoursesPanel";
import { getAdminCourses } from "@/lib/server/admin-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function AdminCoursesPage() {
  const courses = toPlain(await getAdminCourses());

  return (
    <>
      <AdminPageHeader
        title="Courses"
        description="LMS courses with website pricing, duration, and enrollment order details."
      />
      <AdminCoursesPanel courses={courses} />
    </>
  );
}
