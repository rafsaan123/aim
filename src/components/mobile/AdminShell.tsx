import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  UserPlus,
  Users,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/accounts", label: "Accounts", icon: UserPlus },
  { href: "/admin/enrollments", label: "Enroll", icon: Users },
  { href: "/admin/materials", label: "Materials", icon: BookOpen },
  { href: "/admin/tests", label: "Tests", icon: ClipboardCheck },
  { href: "/admin/grading", label: "Grading", icon: ClipboardCheck },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl">
      <header className="safe-top sticky top-0 z-40 border-b border-border bg-slate-900 px-4 pb-4 pt-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          AIM Admin
        </p>
        <h1 className="mt-1 text-xl font-bold">{title}</h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-28">{children}</main>

      <nav className="safe-bottom fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-white/95 backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-muted transition hover:text-primary"
            >
              <Icon className="h-4 w-4" />
              <span className="text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
