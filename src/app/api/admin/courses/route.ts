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
    themeColor: course.themeColor,
    hasImage: Boolean(course.imageMimeType && course.imageFileName),
    createdAt: course.createdAt,
    _count: course._count,
  };
}

export async function GET() {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, materials: true, tests: true } },
    },
  });

  return NextResponse.json({
    courses: courses.map(courseSummary),
    themePresets: COURSE_THEME_PRESETS,
  });
}

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const themeColor = formData.get("themeColor")?.toString();
    const image = formData.get("image");

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const validTheme =
      COURSE_THEME_PRESETS.find((p) => p.color === themeColor)?.color ??
      COURSE_THEME_PRESETS[0].color;

    let imageData: Uint8Array<ArrayBuffer> | undefined;
    let imageMimeType: string | undefined;
    let imageFileName: string | undefined;

    if (image instanceof File && image.size > 0) {
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
      imageData = new Uint8Array(await image.arrayBuffer()) as Uint8Array<ArrayBuffer>;
      imageMimeType = image.type || "image/jpeg";
      imageFileName = image.name;
    }

    const createData: Prisma.CourseCreateInput = {
      title: title.trim(),
      description: description?.trim() || null,
      themeColor: validTheme,
      ...(imageData
        ? {
            imageData,
            imageMimeType,
            imageFileName,
          }
        : {}),
    };

    const course = await db.course.create({
      data: createData,
      include: {
        _count: { select: { enrollments: true, materials: true, tests: true } },
      },
    });

    return NextResponse.json({ course: courseSummary(course) }, { status: 201 });
  }

  const { title, description, themeColor } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const validTheme =
    COURSE_THEME_PRESETS.find((p) => p.color === themeColor)?.color ??
    COURSE_THEME_PRESETS[0].color;

  const course = await db.course.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      themeColor: validTheme,
    },
    include: {
      _count: { select: { enrollments: true, materials: true, tests: true } },
    },
  });

  return NextResponse.json({ course: courseSummary(course) }, { status: 201 });
}
