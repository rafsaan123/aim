"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

type Student = { id: string; name: string; email: string };
type Course = { id: string; title: string };
type Enrollment = {
  id: string;
  user: Student;
  course: Course;
  enrolledAt: string;
};

export default function AdminEnrollmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const [enrollRes, courseRes] = await Promise.all([
      fetch("/api/admin/enrollments"),
      fetch("/api/admin/courses"),
    ]);
    const enrollData = await enrollRes.json();
    const courseData = await courseRes.json();
    setStudents(enrollData.students || []);
    setCourses(enrollData.courses || courseData.courses || []);
    setEnrollments(enrollData.enrollments || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newCourseTitle,
        description: newCourseDesc,
      }),
    });
    setNewCourseTitle("");
    setNewCourseDesc("");
    setMessage("Course created");
    load();
  }

  async function enrollStudent(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, courseId }),
    });
    setMessage("Student enrolled successfully");
    load();
  }

  async function deleteEnrollment(enrollment: Enrollment) {
    if (
      !confirm(
        `Remove ${enrollment.user.name} from ${enrollment.course.title}?`
      )
    ) {
      return;
    }

    setDeletingId(enrollment.id);
    const res = await fetch("/api/admin/enrollments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: enrollment.id }),
    });

    if (res.ok) {
      setMessage("Enrollment removed");
      load();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to remove enrollment");
    }
    setDeletingId(null);
  }

  return (
    <AdminShell title="Enroll Courses">
      <form onSubmit={createCourse} className="mb-6">
        <Card className="space-y-3">
          <h2 className="font-semibold">Create new course</h2>
          <Field label="Course title">
            <Input
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="e.g. Physics Batch A"
              required
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </Field>
          <Button type="submit" variant="secondary" fullWidth>
            Add course
          </Button>
        </Card>
      </form>

      <form onSubmit={enrollStudent}>
        <Card className="space-y-3">
          <h2 className="font-semibold">Enroll student in course</h2>
          <Field label="Student">
            <Select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Course">
            <Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          {message ? (
            <p className="text-sm text-success">{message}</p>
          ) : null}
          <Button type="submit" fullWidth>
            Enroll student
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
        Enrollments
      </h2>
      <div className="space-y-2">
        {enrollments.map((e) => (
          <Card key={e.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{e.user.name}</p>
                <p className="text-sm text-muted">{e.course.title}</p>
              </div>
              <Button
                variant="danger"
                className="shrink-0 px-3 py-2 text-xs"
                disabled={deletingId === e.id}
                onClick={() => deleteEnrollment(e)}
              >
                {deletingId === e.id ? "Removing..." : "Remove"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
