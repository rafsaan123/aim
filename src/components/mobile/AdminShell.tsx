import type { ReactNode } from "react";
import { AdminBottomNav } from "./AdminBottomNav";

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

      <AdminBottomNav />
    </div>
  );
}
