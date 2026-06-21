"use client";

import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { CourseCard, type CourseCardData } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell title="My Courses" subtitle="Your enrolled batches & programs">
      {loading ? (
        <p className="text-center text-sm text-muted">Loading courses...</p>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses enrolled"
          description="Ask your administrator to enroll you in a course."
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
