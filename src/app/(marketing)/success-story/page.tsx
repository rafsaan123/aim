import Link from "next/link";
import { Quote } from "lucide-react";
import { site, successStories } from "@/lib/marketing-content";

export const metadata = {
  title: "সাফল্যের গল্প | AIM Engineering Job Coaching",
  description: "AIM Engineering Job Coaching-এর শিক্ষার্থীদের সাফল্যের গল্প।",
};

export default function SuccessStoryPage() {
  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">সাফল্যের গল্প</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            আমাদের শিক্ষার্থীরা যা অর্জন করেছেন
          </h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            পরিশ্রম, সঠিক গাইডলাইন ও AIM-এর সাপোর্ট — তাদের নিজের কথায়।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {successStories.map((story) => (
            <article
              key={story.name}
              className="relative rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <Quote
                size={32}
                className="absolute right-5 top-5 text-indigo-100"
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-muted">&ldquo;{story.quote}&rdquo;</p>
              <footer className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-700 text-lg font-bold text-white">
                  {story.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{story.name}</p>
                  <p className="text-sm text-primary">{story.role}</p>
                  <p className="text-xs text-muted">{story.batch}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl px-4 text-center sm:px-6">
          <p className="text-lg font-semibold text-foreground">
            আপনিও পারেন — আজই যোগ দিন
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            যোগাযোগ করুন
          </Link>
        </div>
      </section>
    </>
  );
}
