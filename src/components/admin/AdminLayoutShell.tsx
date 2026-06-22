"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookMarked,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/books", label: "Books", icon: BookMarked },
      { href: "/admin/success-stories", label: "Success Stories", icon: Sparkles },
    ],
  },
  {
    label: "LMS",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/courses", label: "Courses", icon: GraduationCap },
      { href: "/admin/materials", label: "Materials", icon: BookOpen },
      { href: "/admin/tests", label: "Tests", icon: ClipboardCheck },
      { href: "/admin/grading", label: "Grading", icon: ClipboardCheck },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-white/15 text-white"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-amber-300" : ""}`} />
      {label}
    </Link>
  );
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0b1f3a] transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <Image
              src="/brand/aim-logo.png"
              alt="AIM"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <div>
              <p className="text-sm font-bold text-white">AIM Admin</p>
              <p className="text-[10px] text-amber-300">Survey Engineering</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-300 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ← Public website
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-border p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <p className="text-sm font-medium text-muted lg:hidden">AIM Admin</p>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      {description ? <p className="mt-1 text-sm text-muted sm:text-base">{description}</p> : null}
    </div>
  );
}
