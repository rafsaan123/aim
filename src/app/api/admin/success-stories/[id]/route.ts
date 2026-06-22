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
  const data: Prisma.SuccessStoryUpdateInput = {};

  const name = formData.get("name")?.toString();
  if (name?.trim()) data.name = name.trim();
  const role = formData.get("role")?.toString();
  if (role?.trim()) data.role = role.trim();
  const quote = formData.get("quote")?.toString();
  if (quote?.trim()) data.quote = quote.trim();
  if (formData.has("batch")) data.batch = formData.get("batch")?.toString()?.trim() || null;
  if (formData.has("published")) data.published = formData.get("published") !== "false";
  if (formData.has("sortOrder")) data.sortOrder = Number(formData.get("sortOrder") || 0);

  if (formData.get("removeProfile") === "true") {
    data.profileData = null;
    data.profileMimeType = null;
    data.profileFileName = null;
  } else {
    const profile = formData.get("profile");
    if (profile instanceof File && profile.size > 0) {
      if (profile.size > MAX_CATALOG_IMAGE_BYTES) {
        return NextResponse.json({ error: "Photo must be 2 MB or smaller" }, { status: 400 });
      }
      data.profileData = new Uint8Array(await profile.arrayBuffer()) as Uint8Array<ArrayBuffer>;
      data.profileMimeType = profile.type || "image/jpeg";
      data.profileFileName = profile.name;
    }
  }

  const story = await db.successStory.update({ where: { id }, data });
  return NextResponse.json({ story });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.successStory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
