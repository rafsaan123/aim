"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Button, Card, Field, Input } from "@/components/ui";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  enrollments: { course: { title: string } }[];
};

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create account");
    } else {
      setMessage("Student account created successfully");
      setName("");
      setEmail("");
      setPassword("");
      loadUsers();
    }
    setLoading(false);
  }

  return (
    <AdminShell title="Create Account">
      <form onSubmit={handleCreate} className="space-y-3">
        <Card className="space-y-3">
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
          {error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : null}
          {message ? (
            <p className="text-sm text-success">{message}</p>
          ) : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Creating..." : "Create student account"}
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
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
