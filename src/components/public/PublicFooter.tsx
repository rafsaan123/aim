import Link from "next/link";
import { navLinks, site } from "@/lib/marketing-content";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#071628] text-blue-100/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">{site.name}</p>
          <p className="mt-2 text-sm text-amber-300">{site.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed">
            ইঞ্জিনিয়ারিং চাকরির প্রস্তুতিতে আপনার বিশ্বস্ত অনলাইন কোচিং প্ল্যাটফর্ম।
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">মেনু</p>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={site.loginPath} className="transition hover:text-white">
                শিক্ষার্থী পোর্টাল
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white">যোগাযোগ</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="transition hover:text-white">
                {site.email}
              </a>
            </li>
            <li>{site.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-blue-100/50">
        © {new Date().getFullYear()} AIM Engineering Job Coaching · aimsurveyjob.com
      </div>
    </footer>
  );
}
