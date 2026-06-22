"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Trophy,
  User,
} from "lucide-react";

const tabs = [
  { href: "/student/materials", label: "Materials", icon: BookOpen },
  { href: "/student/tests", label: "Tests", icon: ClipboardList },
  { href: "/student/results", label: "Results", icon: Trophy },
  { href: "/student/courses", label: "Courses", icon: GraduationCap },
  { href: "/student/profile", label: "Profile", icon: User },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-5 gap-0.5 px-1 pb-1.5 pt-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition ${
                active
                  ? "bg-indigo-50 text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5px]" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
