"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/materials", label: "Materials", icon: BookOpen },
  { href: "/admin/tests", label: "Tests", icon: ClipboardCheck },
  { href: "/admin/grading", label: "Grading", icon: ClipboardCheck },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-white/95 backdrop-blur-md">
      <div className="grid grid-cols-3 gap-1 px-2 py-2">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition ${
                active ? "text-primary" : "text-muted hover:text-primary"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "stroke-[2.5px]" : ""}`} />
              <span className="text-center leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
