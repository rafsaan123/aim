"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, Field, Input, Textarea } from "@/components/ui";
import { formatPriceBdt } from "@/lib/catalog";

type Book = {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  price: number;
  inStock: boolean;
  orderDetails: string | null;
  published: boolean;
  sortOrder: number;
  coverFileName: string | null;
  coverMimeType: string | null;
};

export function AdminBooksPanel({ books }: { books: Book[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function createBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/admin/books", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create book");
      return;
    }
    form.reset();
    setMessage("Book added");
    router.refresh();
  }

  async function updateBook(id: string, formData: FormData) {
    const res = await fetch(`/api/admin/books/${id}`, { method: "PATCH", body: formData });
    if (res.ok) router.refresh();
  }

  async function deleteBook(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={createBook}>
        <Card className="space-y-3">
          <h2 className="font-semibold">Add book</h2>
          <Field label="Title *">
            <Input name="title" required />
          </Field>
          <Field label="Author">
            <Input name="author" />
          </Field>
          <Field label="Description">
            <Textarea name="description" rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (BDT)">
              <Input name="price" type="number" min={0} defaultValue={0} />
            </Field>
            <Field label="Sort order">
              <Input name="sortOrder" type="number" defaultValue={0} />
            </Field>
          </div>
          <Field label="Order instructions">
            <Textarea name="orderDetails" rows={2} placeholder="Payment / delivery info..." />
          </Field>
          <Field label="Cover image">
            <Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="inStock" defaultChecked className="rounded" />
            In stock
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked className="rounded" />
            Published on website
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button type="submit" fullWidth>
            Add book
          </Button>
        </Card>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          All books ({books.length})
        </h2>
        {books.map((book) => (
          <Card key={book.id} className="space-y-3">
            <div className="flex gap-3">
              <img
                src={
                  book.coverFileName
                    ? `/api/books/${book.id}/cover`
                    : "/brand/aim-logo.png"
                }
                alt={book.title}
                className="h-20 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{book.title}</p>
                <p className="text-sm text-primary">{formatPriceBdt(book.price)}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {!book.published ? <Badge tone="warning">Draft</Badge> : null}
                  {!book.inStock ? <Badge tone="danger">Out of stock</Badge> : null}
                </div>
              </div>
              <Button
                variant="danger"
                className="shrink-0 text-xs"
                onClick={() => deleteBook(book.id, book.title)}
              >
                Delete
              </Button>
            </div>
            <BookEditForm book={book} onSave={updateBook} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function BookEditForm({
  book,
  onSave,
}: {
  book: Book;
  onSave: (id: string, data: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        Edit details
      </Button>
    );
  }

  return (
    <form
      className="space-y-2 border-t border-border pt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("inStock", (e.currentTarget.elements.namedItem("inStock") as HTMLInputElement).checked ? "true" : "false");
        fd.set("published", (e.currentTarget.elements.namedItem("published") as HTMLInputElement).checked ? "true" : "false");
        await onSave(book.id, fd);
        setOpen(false);
      }}
    >
      <Field label="Title">
        <Input name="title" defaultValue={book.title} />
      </Field>
      <Field label="Price">
        <Input name="price" type="number" defaultValue={book.price} />
      </Field>
      <Field label="Description">
        <Textarea name="description" rows={2} defaultValue={book.description || ""} />
      </Field>
      <Field label="Order details">
        <Textarea name="orderDetails" rows={2} defaultValue={book.orderDetails || ""} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="inStock" defaultChecked={book.inStock} />
        In stock
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={book.published} />
        Published
      </label>
      <Button type="submit" fullWidth>
        Save
      </Button>
    </form>
  );
}
