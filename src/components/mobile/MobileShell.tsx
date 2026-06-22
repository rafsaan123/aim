import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { StudentBottomNav } from "./StudentBottomNav";

export function MobileShell({
  title,
  subtitle,
  children,
  showNav = true,
  backHref,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showNav?: boolean;
  backHref?: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="safe-top sticky top-0 z-40 border-b border-white/10 bg-[#0b1f3a] text-white shadow-md">
        <div className="flex items-center gap-3 px-4 pb-4 pt-5">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <Image
              src="/brand/aim-logo.png"
              alt="AIM"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-blue-100/80">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className={`flex-1 px-4 py-4 ${showNav ? "pb-24" : "pb-6"}`}>
        {children}
      </main>

      {showNav ? <StudentBottomNav /> : null}
    </div>
  );
}
