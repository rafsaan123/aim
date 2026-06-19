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
  { href: "/student/materials", label: "Study", icon: BookOpen },
  { href: "/student/tests", label: "Test", icon: ClipboardList },
  { href: "/student/results", label: "Result", icon: Trophy },
  { href: "/student/courses", label: "Courses", icon: GraduationCap },
  { href: "/student/profile", label: "Profile", icon: User },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-white/95 backdrop-blur-md">
      <div className="grid grid-cols-5 px-1 pb-2 pt-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition ${
                active
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "stroke-[2.5px]" : ""}`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
