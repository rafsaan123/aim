import { NextResponse } from "next/server";
import { Prisma, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { isAllowedCatalogImage, MAX_CATALOG_IMAGE_BYTES } from "@/lib/catalog";
import { db } from "@/lib/db";

function bookSummary(book: {
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
  createdAt: Date;
}) {
  return {
    id: book.id,
    title: book.title,
    description: book.description,
    author: book.author,
    price: book.price,
    inStock: book.inStock,
    orderDetails: book.orderDetails,
    published: book.published,
    sortOrder: book.sortOrder,
    hasCover: Boolean(book.coverFileName && book.coverMimeType),
    createdAt: book.createdAt,
  };
}

export async function GET() {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const books = await db.book.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ books: books.map(bookSummary) });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const author = formData.get("author")?.toString();
  const price = Number(formData.get("price") || 0);
  const inStock = formData.get("inStock") !== "false";
  const published = formData.get("published") !== "false";
  const orderDetails = formData.get("orderDetails")?.toString();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const cover = formData.get("cover");

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let coverData: Uint8Array<ArrayBuffer> | undefined;
  let coverMimeType: string | undefined;
  let coverFileName: string | undefined;

  if (cover instanceof File && cover.size > 0) {
    if (cover.size > MAX_CATALOG_IMAGE_BYTES) {
      return NextResponse.json({ error: "Cover must be 2 MB or smaller" }, { status: 400 });
    }
    if (!isAllowedCatalogImage(cover.type || "", cover.name)) {
      return NextResponse.json({ error: "Use JPG, PNG, or WEBP" }, { status: 400 });
    }
    coverData = new Uint8Array(await cover.arrayBuffer()) as Uint8Array<ArrayBuffer>;
    coverMimeType = cover.type || "image/jpeg";
    coverFileName = cover.name;
  }

  const createData: Prisma.BookCreateInput = {
    title: title.trim(),
    description: description?.trim() || null,
    author: author?.trim() || null,
    price: Math.max(0, Math.floor(price)),
    inStock,
    published,
    orderDetails: orderDetails?.trim() || null,
    sortOrder,
    ...(coverData ? { coverData, coverMimeType, coverFileName } : {}),
  };

  const book = await db.book.create({
    data: createData,
  });

  return NextResponse.json({ book: bookSummary(book) }, { status: 201 });
}
