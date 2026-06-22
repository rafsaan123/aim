import { NextResponse } from "next/server";
import { Prisma, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { isAllowedCatalogImage, MAX_CATALOG_IMAGE_BYTES } from "@/lib/catalog";
import { db } from "@/lib/db";

function storySummary(story: {
  id: string;
  name: string;
  role: string;
  quote: string;
  batch: string | null;
  published: boolean;
  sortOrder: number;
  profileFileName: string | null;
  profileMimeType: string | null;
  createdAt: Date;
}) {
  return {
    id: story.id,
    name: story.name,
    role: story.role,
    quote: story.quote,
    batch: story.batch,
    published: story.published,
    sortOrder: story.sortOrder,
    hasProfile: Boolean(story.profileFileName && story.profileMimeType),
    createdAt: story.createdAt,
  };
}

export async function GET() {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stories = await db.successStory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ stories: stories.map(storySummary) });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const role = formData.get("role")?.toString();
  const quote = formData.get("quote")?.toString();
  const batch = formData.get("batch")?.toString();
  const published = formData.get("published") !== "false";
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const profile = formData.get("profile");

  if (!name?.trim() || !role?.trim() || !quote?.trim()) {
    return NextResponse.json({ error: "Name, role, and quote are required" }, { status: 400 });
  }

  let profileData: Uint8Array<ArrayBuffer> | undefined;
  let profileMimeType: string | undefined;
  let profileFileName: string | undefined;

  if (profile instanceof File && profile.size > 0) {
    if (profile.size > MAX_CATALOG_IMAGE_BYTES) {
      return NextResponse.json({ error: "Photo must be 2 MB or smaller" }, { status: 400 });
    }
    if (!isAllowedCatalogImage(profile.type || "", profile.name)) {
      return NextResponse.json({ error: "Use JPG, PNG, or WEBP" }, { status: 400 });
    }
    profileData = new Uint8Array(await profile.arrayBuffer()) as Uint8Array<ArrayBuffer>;
    profileMimeType = profile.type || "image/jpeg";
    profileFileName = profile.name;
  }

  const createData: Prisma.SuccessStoryCreateInput = {
    name: name.trim(),
    role: role.trim(),
    quote: quote.trim(),
    batch: batch?.trim() || null,
    published,
    sortOrder,
    ...(profileData ? { profileData, profileMimeType, profileFileName } : {}),
  };

  const story = await db.successStory.create({
    data: createData,
  });

  return NextResponse.json({ story: storySummary(story) }, { status: 201 });
}
