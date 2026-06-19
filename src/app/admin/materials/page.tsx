"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

type Course = { id: string; title: string };
type Material = {
  id: string;
  title: string;
  content: string;
  course: Course;
  createdAt: string;
};

export default function AdminMaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/materials");
    const data = await res.json();
    setCourses(data.courses || []);
    setMaterials(data.materials || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, title, content }),
    });
    setTitle("");
    setContent("");
    setMessage("Study material added");
    load();
  }

  return (
    <AdminShell title="Study Materials">
      <form onSubmit={handleSubmit}>
        <Card className="space-y-3">
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
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter 1: Introduction"
              required
            />
          </Field>
          <Field label="Content">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste notes, instructions, or links..."
              rows={5}
              required
            />
          </Field>
          {message ? (
            <p className="text-sm text-success">{message}</p>
          ) : null}
          <Button type="submit" fullWidth>
            Add study material
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
        All materials ({materials.length})
      </h2>
      <div className="space-y-2">
        {materials.map((m) => (
          <Card key={m.id}>
            <Badge>{m.course.title}</Badge>
            <p className="mt-2 font-semibold">{m.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{m.content}</p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
