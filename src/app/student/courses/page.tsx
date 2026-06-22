import { MobileShell } from "@/components/mobile/MobileShell";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui";
import { getStudentCourses } from "@/lib/server/student-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function StudentCoursesPage() {
  const courses = toPlain(await getStudentCourses());

  return (
    <MobileShell title="My Courses">
      {courses.length === 0 ? (
        <EmptyState
          title="No courses"
          description="Contact your administrator to get enrolled."
        />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </MobileShell>
  );
}
