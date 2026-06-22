import Link from "next/link";
import { courses, site } from "@/lib/marketing-content";

export const metadata = {
  title: "কোর্স | AIM Engineering Job Coaching",
  description: "ইঞ্জিনিয়ারিং চাকরির প্রস্তুতির কোর্সসমূহ — BCS, ব্যাংক, সরকারি MCQ ও আরও।",
};

export default function CoursesPage() {
  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">কোর্স</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">আমাদের কোর্সসমূহ</h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            ইঞ্জিনিয়ারিং চাকরির লক্ষ্য অনুযায়ী সাজানো কোর্স — MCQ, written, viva ও
            ইন্টারভিউ প্রস্তুতি।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.title}
              className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={`bg-gradient-to-r ${course.accent} px-6 py-5 text-white`}>
                <h2 className="text-xl font-bold">{course.title}</h2>
                <p className="mt-2 text-sm text-white/90">
                  সময়কাল: {course.duration} · {course.level}
                </p>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-muted">{course.description}</p>
                <Link
                  href="/contact"
                  className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  ভর্তি ও তথ্য →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center sm:p-8">
            <p className="font-semibold text-indigo-900">ইতিমধ্যে শিক্ষার্থী?</p>
            <p className="mt-2 text-sm text-indigo-800">
              আপনার কোর্স ম্যাটেরিয়াল ও টেস্ট পোর্টালে দেখুন।
            </p>
            <Link
              href={site.loginPath}
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              পোর্টালে লগইন
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
