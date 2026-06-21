"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Button, Card, Field, Input, Select } from "@/components/ui";

type Student = { id: string; name: string; email: string };
type Course = { id: string; title: string };
type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  enrollments: { course: { title: string } }[];
};
type Enrollment = {
  id: string;
  user: Student;
  course: Course;
  enrolledAt: string;
};

export default function AdminUsersPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const [enrollRes, usersRes] = await Promise.all([
      fetch("/api/admin/enrollments"),
      fetch("/api/admin/users"),
    ]);
    const enrollData = await enrollRes.json();
    const usersData = await usersRes.json();
    setStudents(enrollData.students || []);
    setCourses(enrollData.courses || []);
    setEnrollments(enrollData.enrollments || []);
    setUsers(usersData.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create account");
    } else {
      setMessage("Student account created");
      setName("");
      setEmail("");
      setPassword("");
      load();
    }
    setCreating(false);
  }

  async function enrollStudent(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, courseId }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to enroll student");
      return;
    }

    setMessage("Student enrolled successfully");
    setUserId("");
    setCourseId("");
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
      setError(data.error || "Failed to remove enrollment");
    }
    setDeletingId(null);
  }

  return (
    <AdminShell title="User Manage">
      <form onSubmit={createAccount} className="mb-6">
        <Card className="space-y-3">
          <h2 className="font-semibold">Create student account</h2>
          <Field label="Full name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              required
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password"
              required
            />
          </Field>
          <Button type="submit" variant="secondary" fullWidth disabled={creating}>
            {creating ? "Creating..." : "Create account"}
          </Button>
        </Card>
      </form>

      <form onSubmit={enrollStudent} className="mb-6">
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
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button type="submit" fullWidth>
            Enroll student
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Enrollments ({enrollments.length})
      </h2>
      <div className="mb-6 space-y-2">
        {enrollments.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No enrollments yet.</p>
          </Card>
        ) : (
          enrollments.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{e.user.name}</p>
                  <p className="text-sm text-muted">{e.course.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                  </p>
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
          ))
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        All students ({users.length})
      </h2>
      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id}>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            {user.enrollments.length > 0 ? (
              <p className="mt-1 text-xs text-muted">
                Courses: {user.enrollments.map((e) => e.course.title).join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">No courses enrolled</p>
            )}
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
