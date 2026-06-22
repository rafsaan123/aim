"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PageLink } from "@/components/public/PageLink";
import { navLinks, site } from "@/lib/marketing-content";

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1f3a]/90 backdrop-blur-lg safe-top">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <PageLink href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/brand/aim-logo.png"
            alt={site.name}
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold text-white">AIM Engineering</p>
            <p className="text-xs text-amber-300">Job Coaching</p>
          </div>
        </PageLink>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <PageLink
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-blue-100/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </PageLink>
            );
          })}
          <PageLink
            href={site.loginPath}
            className="ml-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            লগইন
          </PageLink>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "মেনু বন্ধ" : "মেনু খুলুন"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#0b1f3a] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <PageLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    active ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </PageLink>
              );
            })}
            <PageLink
              href={site.loginPath}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              লগইন / পোর্টাল
            </PageLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
