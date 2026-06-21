"use client";

import { useEffect, useState } from "react";
import { ThemeSwatches } from "@/components/courses/CourseCard";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";

type Course = {
  id: string;
  title: string;
  description: string | null;
  themeColor: string;
  hasImage: boolean;
  _count: { enrollments: number; materials: number; tests: number };
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseTheme, setNewCourseTheme] = useState("#1d4ed8");
  const [newCourseImage, setNewCourseImage] = useState<File | null>(null);
  const [newCoursePreview, setNewCoursePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setCourses(data.courses || []);
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

  async function deleteCourse(course: Course) {
    if (
      !confirm(
        `Delete "${course.title}"? This removes materials, tests, and enrollments.`
      )
    ) {
      return;
    }

    setDeletingId(course.id);
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage(`Deleted ${course.title}`);
      load();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete course");
    }
    setDeletingId(null);
  }

  return (
    <AdminShell title="Course Manage">
      <form onSubmit={createCourse} className="mb-6">
        <Card className="space-y-3">
          <h2 className="font-semibold">Create new course</h2>
          <p className="text-xs text-muted">
            Add cover image and theme color for batch-style course cards.
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
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button type="submit" variant="secondary" fullWidth>
            Add course
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        All courses ({courses.length})
      </h2>
      <div className="space-y-3">
        {courses.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No courses yet. Create one above.</p>
          </Card>
        ) : (
          courses.map((course) => (
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
                <Button
                  variant="danger"
                  className="shrink-0 self-start px-3 py-2 text-xs"
                  disabled={deletingId === course.id}
                  onClick={() => deleteCourse(course)}
                >
                  {deletingId === course.id ? "..." : "Delete"}
                </Button>
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
          ))
        )}
      </div>
    </AdminShell>
  );
}
