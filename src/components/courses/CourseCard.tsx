"use client";

import Link from "next/link";
import { BookOpen, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui";
import { COURSE_THEME_PRESETS, getCourseTheme } from "@/lib/course-themes";

export type CourseCardData = {
  id: string;
  title: string;
  description: string | null;
  themeColor: string;
  hasImage: boolean;
  enrolledAt?: string;
  _count: { materials: number; tests: number };
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const theme = getCourseTheme(course.themeColor);
  const coverSrc = course.hasImage
    ? `/api/courses/${course.id}/cover`
    : "/brand/aim-logo.png";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={coverSrc}
          alt={course.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/brand/aim-logo.png";
          }}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-80 mix-blend-multiply`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold leading-tight">{course.title}</h3>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {course.description ? (
          <p className="line-clamp-2 text-sm text-muted">{course.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Badge>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course._count.materials}
            </span>
          </Badge>
          <Badge>
            <span className="inline-flex items-center gap-1">
              <ClipboardList className="h-3 w-3" />
              {course._count.tests}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/student/materials?course=${course.id}`}
            className="rounded-xl px-3 py-2.5 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: course.themeColor }}
          >
            Materials
          </Link>
          <Link
            href={`/student/tests?course=${course.id}`}
            className="rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-foreground transition-colors hover:bg-slate-100"
          >
            Tests
          </Link>
        </div>

        {course.enrolledAt ? (
          <p className="text-xs text-muted">
            Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ThemeSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COURSE_THEME_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={preset.label}
          onClick={() => onChange(preset.color)}
          className={`h-9 w-9 rounded-full border-2 transition-transform ${
            value === preset.color
              ? "scale-110 border-foreground"
              : "border-white shadow-sm"
          }`}
          style={{ backgroundColor: preset.color }}
        />
      ))}
    </div>
  );
}
