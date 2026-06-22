import Link from "next/link";
import { getCourseTheme } from "@/lib/course-themes";
import { formatPriceBdt } from "@/lib/catalog";
import { ContactOrderButton } from "@/components/public/ContactOrderButton";
import { site } from "@/lib/marketing-content";
import {
  getPublishedCourses,
  hasCourseImage,
} from "@/lib/server/marketing-queries";

export const metadata = {
  title: "কোর্স | AIM Survey Engineering Coaching",
  description: "সার্ভে ইঞ্জিনিয়ারিং চাকরি প্রস্তুতির কোর্সসমূহ।",
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">কোর্স</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">সার্ভে ইঞ্জিনিয়ারিং কোর্স</h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            BCS সার্ভে, সরকারি সার্ভে পদ, MCQ, written ও viva — সব এক জায়গায়।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {courses.length === 0 ? (
            <p className="text-muted md:col-span-2">শীঘ্রই নতুন কোর্স যোগ করা হবে।</p>
          ) : (
            courses.map((course) => {
              const theme = getCourseTheme(course.themeColor);
              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
                >
                  <div className={`bg-gradient-to-r ${theme.gradient} px-6 py-5 text-white`}>
                    <h2 className="text-xl font-bold">{course.title}</h2>
                    <p className="mt-2 text-sm text-white/90">
                      {course.duration ? `সময়কাল: ${course.duration}` : null}
                      {course.price != null && course.price > 0
                        ? ` · ${formatPriceBdt(course.price)}`
                        : null}
                    </p>
                  </div>
                  {hasCourseImage(course) ? (
                    <img
                      src={`/api/courses/${course.id}/cover`}
                      alt={course.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : null}
                  <div className="space-y-4 p-6">
                    {course.description ? (
                      <p className="text-sm leading-relaxed text-muted">{course.description}</p>
                    ) : null}
                    {course.orderDetails ? (
                      <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-muted">
                        {course.orderDetails}
                      </p>
                    ) : null}
                    <ContactOrderButton label="ভর্তি / অর্ডার করতে কল করুন" />
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center sm:p-8">
            <p className="font-semibold text-indigo-900">ইতিমধ্যে ভর্তি?</p>
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
