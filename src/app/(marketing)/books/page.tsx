import Link from "next/link";
import { BookOpen } from "lucide-react";
import { books, site } from "@/lib/marketing-content";

export const metadata = {
  title: "বই | AIM Engineering Job Coaching",
  description: "ইঞ্জিনিয়ারিং চাকরি প্রস্তুতির বই, PDF ও MCQ ব্যাংক।",
};

export default function BooksPage() {
  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">বই ও রিসোর্স</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">পড়াশোনার বই</h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            MCQ ব্যাংক, written গাইড ও ইন্টারভিউ হ্যান্ডবুক — ডিজিটাল ও প্রিন্ট
            ফরম্যাটে।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 sm:grid-cols-2">
          {books.map((book) => (
            <article
              key={book.title}
              className="flex gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                <BookOpen size={28} />
              </div>
              <div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
                  {book.type}
                </span>
                <h2 className="mt-2 font-bold text-foreground">{book.title}</h2>
                <p className="text-xs text-muted">{book.author}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {book.description}
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  অর্ডার / জিজ্ঞাসা →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-6xl px-4 text-center sm:px-6">
          <p className="text-sm text-muted">
            ভর্তিকৃত শিক্ষার্থীরা পোর্টাল থেকে PDF ও ম্যাটেরিয়াল ডাউনলোড করতে পারেন।
          </p>
          <Link
            href={site.loginPath}
            className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          >
            শিক্ষার্থী পোর্টাল →
          </Link>
        </div>
      </section>
    </>
  );
}
