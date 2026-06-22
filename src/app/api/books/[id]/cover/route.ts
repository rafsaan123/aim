import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const book = await db.book.findUnique({
    where: { id, published: true },
    select: { coverData: true, coverMimeType: true, coverFileName: true },
  });

  if (!book?.coverData || !book.coverMimeType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(book.coverData), {
    headers: {
      "Content-Type": book.coverMimeType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
