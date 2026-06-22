"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, Field, Input, Textarea } from "@/components/ui";

type Story = {
  id: string;
  name: string;
  role: string;
  quote: string;
  batch: string | null;
  published: boolean;
  sortOrder: number;
  profileFileName: string | null;
  profileMimeType: string | null;
};

export function AdminSuccessStoriesPanel({ stories }: { stories: Story[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createStory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("published", (form.elements.namedItem("published") as HTMLInputElement).checked ? "true" : "false");

    const res = await fetch("/api/admin/success-stories", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create story");
      return;
    }
    form.reset();
    setMessage("Success story added");
    router.refresh();
  }

  async function deleteStory(id: string, name: string) {
    if (!confirm(`Delete story for "${name}"?`)) return;
    await fetch(`/api/admin/success-stories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={createStory}>
        <Card className="space-y-3">
          <h2 className="font-semibold">Add success story</h2>
          <Field label="Name *">
            <Input name="name" required />
          </Field>
          <Field label="Achievement / role *">
            <Input name="role" placeholder="e.g. Survey Engineer — Govt." required />
          </Field>
          <Field label="Quote *">
            <Textarea name="quote" rows={4} required />
          </Field>
          <Field label="Batch">
            <Input name="batch" placeholder="2024 batch" />
          </Field>
          <Field label="Profile photo">
            <Input name="profile" type="file" accept="image/jpeg,image/png,image/webp" />
          </Field>
          <Field label="Sort order">
            <Input name="sortOrder" type="number" defaultValue={0} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked />
            Published on website
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button type="submit" fullWidth>
            Add story
          </Button>
        </Card>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          All stories ({stories.length})
        </h2>
        {stories.map((story) => (
          <Card key={story.id} className="flex gap-3">
            <img
              src={
                story.profileFileName
                  ? `/api/success-stories/${story.id}/profile`
                  : "/brand/aim-logo.png"
              }
              alt={story.name}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{story.name}</p>
                  <p className="text-sm text-primary">{story.role}</p>
                </div>
                {!story.published ? <Badge tone="warning">Draft</Badge> : null}
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted">&ldquo;{story.quote}&rdquo;</p>
              <Button
                variant="danger"
                className="mt-2 text-xs"
                onClick={() => deleteStory(story.id, story.name)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
