"use client";

import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Card, EmptyState } from "@/components/ui";

type Course = {
  id: string;
  title: string;
  description: string | null;
  enrolledAt: string;
  _count: { materials: number; tests: number };
};

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell title="Courses" subtitle="Your enrolled courses">
      {loading ? (
        <p className="text-center text-sm text-muted">Loading courses...</p>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses enrolled"
          description="Ask your administrator to enroll you in a course."
        />
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <h3 className="font-semibold">{course.title}</h3>
              {course.description ? (
                <p className="mt-1 text-sm text-muted">{course.description}</p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Badge>{course._count.materials} materials</Badge>
                <Badge>{course._count.tests} tests</Badge>
              </div>
              <p className="mt-2 text-xs text-muted">
                Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </MobileShell>
  );
}
