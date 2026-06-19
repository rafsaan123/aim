"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

type Course = { id: string; title: string };
type Material = {
  id: string;
  title: string;
  fileName: string;
  fileType: "PDF" | "IMAGE";
  mimeType: string;
  course: Course;
  createdAt: string;
};

export default function AdminMaterialsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!file) {
      setError("Please choose a PDF or image file.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    const res = await fetch("/api/admin/materials", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Upload failed");
    } else {
      setMessage("Study material uploaded");
      setTitle("");
      setDescription("");
      setFile(null);
      load();
    }
    setLoading(false);
  }

  async function deleteMaterial(material: Material) {
    if (!confirm(`Delete "${material.title}"?`)) return;

    setDeletingId(material.id);
    await fetch("/api/admin/materials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: material.id }),
    });
    setMessage("Material deleted");
    load();
    setDeletingId(null);
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
          <Field label="Notes (optional text for students)">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary or instructions shown above the file"
              rows={3}
            />
          </Field>
          <Field label="PDF or image file">
            <Input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="mt-1 text-xs text-muted">
              PDF, JPG, PNG, or WEBP · Max 4 MB · Downloads include student watermark
            </p>
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Uploading..." : "Upload study material"}
          </Button>
        </Card>
      </form>

      <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
        All materials ({materials.length})
      </h2>
      <div className="space-y-2">
        {materials.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex gap-2">
                  <Badge>{m.course.title}</Badge>
                  <Badge tone={m.fileType === "PDF" ? "default" : "success"}>
                    {m.fileType}
                  </Badge>
                </div>
                <p className="mt-2 font-semibold">{m.title}</p>
                <p className="mt-1 truncate text-xs text-muted">{m.fileName}</p>
              </div>
              <Button
                variant="danger"
                className="shrink-0 px-3 py-2 text-xs"
                disabled={deletingId === m.id}
                onClick={() => deleteMaterial(m)}
              >
                {deletingId === m.id ? "..." : "Delete"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
