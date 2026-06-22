import { NextResponse } from "next/server";
import { Prisma, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { isAllowedCatalogImage, MAX_CATALOG_IMAGE_BYTES } from "@/lib/catalog";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();
  const data: Prisma.BookUpdateInput = {};

  const title = formData.get("title")?.toString();
  if (title?.trim()) data.title = title.trim();

  if (formData.has("description")) {
    data.description = formData.get("description")?.toString()?.trim() || null;
  }
  if (formData.has("author")) {
    data.author = formData.get("author")?.toString()?.trim() || null;
  }
  if (formData.has("price")) {
    data.price = Math.max(0, Math.floor(Number(formData.get("price") || 0)));
  }
  if (formData.has("inStock")) {
    data.inStock = formData.get("inStock") !== "false";
  }
  if (formData.has("published")) {
    data.published = formData.get("published") !== "false";
  }
  if (formData.has("orderDetails")) {
    data.orderDetails = formData.get("orderDetails")?.toString()?.trim() || null;
  }
  if (formData.has("sortOrder")) {
    data.sortOrder = Number(formData.get("sortOrder") || 0);
  }

  if (formData.get("removeCover") === "true") {
    data.coverData = null;
    data.coverMimeType = null;
    data.coverFileName = null;
  } else {
    const cover = formData.get("cover");
    if (cover instanceof File && cover.size > 0) {
      if (cover.size > MAX_CATALOG_IMAGE_BYTES) {
        return NextResponse.json({ error: "Cover must be 2 MB or smaller" }, { status: 400 });
      }
      if (!isAllowedCatalogImage(cover.type || "", cover.name)) {
        return NextResponse.json({ error: "Use JPG, PNG, or WEBP" }, { status: 400 });
      }
      data.coverData = new Uint8Array(await cover.arrayBuffer()) as Uint8Array<ArrayBuffer>;
      data.coverMimeType = cover.type || "image/jpeg";
      data.coverFileName = cover.name;
    }
  }

  const book = await db.book.update({ where: { id }, data });
  return NextResponse.json({ book });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
