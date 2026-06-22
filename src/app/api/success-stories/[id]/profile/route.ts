import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = await db.successStory.findUnique({
    where: { id, published: true },
    select: { profileData: true, profileMimeType: true, profileFileName: true },
  });

  if (!story?.profileData || !story.profileMimeType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(story.profileData), {
    headers: {
      "Content-Type": story.profileMimeType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
