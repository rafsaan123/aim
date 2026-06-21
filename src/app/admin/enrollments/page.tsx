"use client";

import { useEffect, useState } from "react";
import { ThemeSwatches } from "@/components/courses/CourseCard";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

type Student = { id: string; name: string; email: string };
type Course = {
  id: string;
  title: string;
  description: string | null;
  themeColor: string;
  hasImage: boolean;
  _count: { enrollments: number; materials: number; tests: number };
};
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
  const [newCourseTheme, setNewCourseTheme] = useState("#1d4ed8");
  const [newCourseImage, setNewCourseImage] = useState<File | null>(null);
  const [newCoursePreview, setNewCoursePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function load() {
    const [enrollRes, courseRes] = await Promise.all([
      fetch("/api/admin/enrollments"),
      fetch("/api/admin/courses"),
    ]);
    const enrollData = await enrollRes.json();
    const courseData = await courseRes.json();
    setStudents(enrollData.students || []);
    setCourses(courseData.courses || enrollData.courses || []);
    setEnrollments(enrollData.enrollments || []);
  }

  useEffect(() => {
    load();
  }, []);

  function onNewCourseImageChange(file: File | null) {
    setNewCourseImage(file);
    if (newCoursePreview) URL.revokeObjectURL(newCoursePreview);
    setNewCoursePreview(file ? URL.createObjectURL(file) : null);
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("title", newCourseTitle);
    formData.append("description", newCourseDesc);
    formData.append("themeColor", newCourseTheme);
    if (newCourseImage) formData.append("image", newCourseImage);

    const res = await fetch("/api/admin/courses", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create course");
      return;
    }

    setNewCourseTitle("");
    setNewCourseDesc("");
    setNewCourseTheme("#1d4ed8");
    onNewCourseImageChange(null);
    setMessage("Course created");
    load();
  }

  async function updateCourseImage(course: Course, file: File | null) {
    if (!file) return;

    setUploadingId(course.id);
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("themeColor", course.themeColor);

    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      setMessage(`Cover updated for ${course.title}`);
      load();
    } else {
      setError(data.error || "Failed to update cover");
    }
    setUploadingId(null);
  }

  async function updateCourseTheme(course: Course, themeColor: string) {
    const formData = new FormData();
    formData.append("themeColor", themeColor);

    await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      body: formData,
    });
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
    <AdminShell title="Courses & Enrollments">
      <form onSubmit={createCourse} className="mb-6">
        <Card className="space-y-3">
          <h2 className="font-semibold">Create new course</h2>
          <p className="text-xs text-muted">
            Add a cover image and theme color — styled like 10 Minute School batch
            cards with AIM branding.
          </p>
          <Field label="Course title">
            <Input
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="e.g. HSC 26 Engineering Batch"
              required
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              placeholder="Live classes, materials, tests, and more..."
              rows={2}
            />
          </Field>
          <Field label="Theme color">
            <ThemeSwatches value={newCourseTheme} onChange={setNewCourseTheme} />
          </Field>
          <Field label="Cover image (optional)">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                onNewCourseImageChange(e.target.files?.[0] ?? null)
              }
            />
            {newCoursePreview ? (
              <img
                src={newCoursePreview}
                alt="Cover preview"
                className="mt-2 h-32 w-full rounded-xl object-cover"
              />
            ) : (
              <p className="text-xs text-muted">
                JPG, PNG or WEBP · max 2 MB. Uses AIM logo if empty.
              </p>
            )}
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" variant="secondary" fullWidth>
            Add course
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Manage courses ({courses.length})
      </h2>
      <div className="mb-6 space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="space-y-3">
            <div className="flex gap-3">
              <img
                src={
                  course.hasImage
                    ? `/api/courses/${course.id}/cover`
                    : "/brand/aim-logo.png"
                }
                alt={course.title}
                className="h-16 w-24 shrink-0 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/brand/aim-logo.png";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{course.title}</p>
                <p className="text-xs text-muted">
                  {course._count.enrollments} students · {course._count.materials}{" "}
                  materials · {course._count.tests} tests
                </p>
              </div>
            </div>
            <Field label="Theme">
              <ThemeSwatches
                value={course.themeColor}
                onChange={(color) => updateCourseTheme(course, color)}
              />
            </Field>
            <Field label="Update cover">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingId === course.id}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateCourseImage(course, file);
                  e.target.value = "";
                }}
              />
            </Field>
          </Card>
        ))}
      </div>

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
