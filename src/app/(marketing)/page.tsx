import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  courses,
  homeHighlights,
  site,
  stats,
  successStories,
} from "@/lib/marketing-content";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0b1f3a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, #2563eb 0%, transparent 40%), radial-gradient(circle at 85% 10%, #ea580c 0%, transparent 35%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm font-medium text-amber-300">
              {site.tagline}
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              ইঞ্জিনিয়ারিং চাকরির প্রস্তুতিতে আপনার বিশ্বস্ত সঙ্গী
            </h1>
            <p className="mt-5 text-base leading-relaxed text-blue-100/85 sm:text-lg">
              AIM Engineering Job Coaching-এ পাবেন কোর্স, বই, মক টেস্ট ও ব্যক্তিগত
              গাইডলাইন — সব এক জায়গায়, বাংলায়।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                কোর্স দেখুন
                <ArrowRight size={16} />
              </Link>
              <Link
                href={site.loginPath}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                পোর্টালে লগইন
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-orange-500/20 blur-2xl" />
              <Image
                src="/brand/aim-logo.png"
                alt={site.name}
                width={320}
                height={320}
                priority
                className="relative h-64 w-64 object-contain drop-shadow-2xl sm:h-80 sm:w-80"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              কেন AIM বেছে নেবেন?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              আমরা শুধু ক্লাস নই — সম্পূর্ণ চাকরি প্রস্তুতির একটা সিস্টেম দিই।
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {homeHighlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">জনপ্রিয় কোর্স</h2>
              <p className="mt-2 text-muted">আপনার লক্ষ্য অনুযায়ী বেছে নিন</p>
            </div>
            <Link href="/courses" className="text-sm font-semibold text-primary hover:underline">
              সব কোর্স দেখুন →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {courses.slice(0, 2).map((course) => (
              <article
                key={course.title}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
              >
                <div className={`bg-gradient-to-r ${course.accent} px-6 py-4 text-white`}>
                  <h3 className="text-lg font-bold">{course.title}</h3>
                  <p className="mt-1 text-sm text-white/85">
                    {course.duration} · {course.level}
                  </p>
                </div>
                <p className="p-6 text-sm leading-relaxed text-muted">
                  {course.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1f3a] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">সাফল্যের গল্প</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-blue-100/80">
            আমাদের শিক্ষার্থীরা যেখানে পৌঁছেছেন
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {successStories.slice(0, 2).map((story) => (
              <blockquote
                key={story.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <p className="text-sm leading-relaxed text-blue-50/90">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <footer className="mt-4 border-t border-white/10 pt-4">
                  <p className="font-semibold">{story.name}</p>
                  <p className="text-sm text-amber-300">{story.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/success-story"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200"
            >
              আরও গল্প পড়ুন <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-800 p-8 text-white sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">আজই শুরু করুন</h2>
                <p className="mt-4 leading-relaxed text-blue-100">
                  কোর্স, বই বা যোগাযোগ — যেকোনো বিষয়ে জানতে আমাদের সাথে কথা বলুন।
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["অনলাইন ক্লাস ও ম্যাটেরিয়াল", "মক টেস্ট ও ফলাফল", "বাংলায় সাপোর্ট"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0 text-amber-300" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/contact"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-blue-50"
                >
                  যোগাযোগ করুন
                </Link>
                <Link
                  href="/books"
                  className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  বই দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
