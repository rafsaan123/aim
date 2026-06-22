import { NextResponse } from "next/server";
import { Prisma, Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  COURSE_THEME_PRESETS,
  isAllowedCourseImage,
  MAX_COURSE_IMAGE_BYTES,
} from "@/lib/courses";

function courseSummary(course: {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  duration: string | null;
  orderDetails: string | null;
  published: boolean;
  themeColor: string;
  imageFileName: string | null;
  imageMimeType: string | null;
  createdAt: Date;
  _count: { enrollments: number; materials: number; tests: number };
}) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    duration: course.duration,
    orderDetails: course.orderDetails,
    published: course.published,
    themeColor: course.themeColor,
    hasImage: Boolean(course.imageMimeType && course.imageFileName),
    createdAt: course.createdAt,
    _count: course._count,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const course = await db.course.findUnique({ where: { id } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const themeColor = formData.get("themeColor")?.toString();
  const image = formData.get("image");
  const removeImage = formData.get("removeImage") === "true";

  const data: Prisma.CourseUpdateInput = {};

  if (title?.trim()) data.title = title.trim();
  if (description !== undefined) {
    data.description = description.trim() || null;
  }
  if (formData.has("price")) {
    const price = formData.get("price")?.toString();
    data.price = price ? Math.max(0, Math.floor(Number(price))) : null;
  }
  if (formData.has("duration")) {
    data.duration = formData.get("duration")?.toString()?.trim() || null;
  }
  if (formData.has("orderDetails")) {
    data.orderDetails = formData.get("orderDetails")?.toString()?.trim() || null;
  }
  if (formData.has("published")) {
    data.published = formData.get("published") !== "false";
  }

  if (themeColor) {
    const valid = COURSE_THEME_PRESETS.some((p) => p.color === themeColor);
    data.themeColor = valid ? themeColor : course.themeColor;
  }

  if (removeImage) {
    data.imageData = null;
    data.imageMimeType = null;
    data.imageFileName = null;
  } else if (image instanceof File && image.size > 0) {
    if (image.size > MAX_COURSE_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Course image must be 2 MB or smaller" },
        { status: 400 }
      );
    }
    if (!isAllowedCourseImage(image.type || "", image.name)) {
      return NextResponse.json(
        { error: "Use JPG, PNG, or WEBP for course cover" },
        { status: 400 }
      );
    }

    data.imageData = new Uint8Array(await image.arrayBuffer()) as Uint8Array<ArrayBuffer>;
    data.imageMimeType = image.type || "image/jpeg";
    data.imageFileName = image.name;
  }

  const updated = await db.course.update({
    where: { id },
    data,
    include: {
      _count: { select: { enrollments: true, materials: true, tests: true } },
    },
  });

  return NextResponse.json({ course: courseSummary(updated) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
