import type { ReactNode } from "react";
import { StudentBottomNav } from "./StudentBottomNav";

export function MobileShell({
  title,
  subtitle,
  children,
  showNav = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl">
      <header className="safe-top sticky top-0 z-40 border-b border-border bg-primary px-4 pb-4 pt-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
          AIM Engineering Job Coaching
        </p>
        <h1 className="mt-1 text-xl font-bold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-blue-100">{subtitle}</p>
        ) : null}
      </header>

      <main className={`flex-1 px-4 py-4 ${showNav ? "pb-24" : "pb-6"}`}>
        {children}
      </main>

      {showNav ? <StudentBottomNav /> : null}
    </div>
  );
}
