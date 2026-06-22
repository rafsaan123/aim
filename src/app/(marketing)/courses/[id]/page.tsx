import { PageLink } from "@/components/public/PageLink";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCourseTheme } from "@/lib/course-themes";
import { formatPriceBdt } from "@/lib/catalog";
import { ContactOrderButton } from "@/components/public/ContactOrderButton";
import { site } from "@/lib/marketing-content";
import {
  getPublishedCourseById,
  hasCourseImage,
} from "@/lib/server/marketing-queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await getPublishedCourseById(id);
  if (!course) return { title: "কোর্স পাওয়া যায়নি" };
  return {
    title: `${course.title} | AIM Survey Engineering`,
    description: course.description || course.title,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const course = await getPublishedCourseById(id);
  if (!course) notFound();

  const theme = getCourseTheme(course.themeColor);

  return (
    <>
      <section className={`bg-gradient-to-br ${theme.gradient} px-4 py-10 text-white sm:px-6`}>
        <div className="mx-auto max-w-3xl">
          <PageLink
            href="/courses"
            className="inline-flex items-center gap-1 text-sm text-white/80 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            সব কোর্স
          </PageLink>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{course.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
            {course.duration ? (
              <span className="rounded-full bg-white/15 px-3 py-1">সময়কাল: {course.duration}</span>
            ) : null}
            {course.price != null && course.price > 0 ? (
              <span className="rounded-full bg-white/15 px-3 py-1">
                {formatPriceBdt(course.price)}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-background py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {hasCourseImage(course) ? (
            <img
              src={`/api/courses/${course.id}/cover`}
              alt={course.title}
              className="mb-8 w-full rounded-2xl border border-border object-cover shadow-sm"
            />
          ) : null}

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-foreground">কোর্স সম্পর্কে</h2>
            {course.description ? (
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">
                {course.description}
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted">বিস্তারিত শীঘ্রই যোগ করা হবে।</p>
            )}

            {course.orderDetails ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  ভর্তি / অর্ডার তথ্য
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {course.orderDetails}
                </p>
              </div>
            ) : null}

            <div className="mt-8">
              <ContactOrderButton label="ভর্তি / অর্ডার করতে কল করুন" />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            ইতিমধ্যে ভর্তি?{" "}
            <PageLink href={site.loginPath} className="font-semibold text-primary hover:underline">
              পোর্টালে লগইন করুন
            </PageLink>
          </p>
        </div>
      </section>
    </>
  );
}
