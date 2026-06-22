import Link from "next/link";
import { Quote } from "lucide-react";
import { site } from "@/lib/marketing-content";
import {
  getPublishedSuccessStories,
  hasStoryProfile,
} from "@/lib/server/marketing-queries";

export const metadata = {
  title: "সাফল্যের গল্প | AIM Survey Engineering Coaching",
  description: "সার্ভে ইঞ্জিনিয়ারিং কোর্সে সফল শিক্ষার্থীদের গল্প।",
};

export default async function SuccessStoryPage() {
  const stories = await getPublishedSuccessStories();

  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">সাফল্যের গল্প</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            সার্ভে ইঞ্জিনিয়ারিংয়ে সফল শিক্ষার্থী
          </h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            AIM-এর মাধ্যমে চাকরি পাওয়া শিক্ষার্থীদের অভিজ্ঞতা।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {stories.length === 0 ? (
            <p className="text-muted md:col-span-2">শীঘ্রই সাফল্যের গল্প যোগ করা হবে।</p>
          ) : (
            stories.map((story) => (
              <article
                key={story.id}
                className="relative rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <Quote size={32} className="absolute right-5 top-5 text-indigo-100" aria-hidden />
                <p className="text-sm leading-relaxed text-muted">&ldquo;{story.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                  {hasStoryProfile(story) ? (
                    <img
                      src={`/api/success-stories/${story.id}/profile`}
                      alt={story.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-700 text-lg font-bold text-white">
                      {story.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">{story.name}</p>
                    <p className="text-sm text-primary">{story.role}</p>
                    {story.batch ? <p className="text-xs text-muted">{story.batch}</p> : null}
                  </div>
                </footer>
              </article>
            ))
          )}
        </div>

        <div className="mx-auto mt-12 max-w-2xl px-4 text-center sm:px-6">
          <Link
            href="/contact"
            className="inline-block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            যোগাযোগ করুন
          </Link>
        </div>
      </section>
    </>
  );
}
