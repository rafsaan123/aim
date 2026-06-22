import Link from "next/link";
import { X } from "lucide-react";

export function CourseFilterBanner({
  courseTitle,
  clearHref,
}: {
  courseTitle: string;
  clearHref: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5">
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-primary">
        {courseTitle}
      </p>
      <Link
        href={clearHref}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-white hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
        Clear
      </Link>
    </div>
  );
}
