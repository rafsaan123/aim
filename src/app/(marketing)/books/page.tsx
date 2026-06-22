import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatPriceBdt } from "@/lib/catalog";
import { ContactOrderButton } from "@/components/public/ContactOrderButton";
import { Badge } from "@/components/ui";
import { site } from "@/lib/marketing-content";
import { getPublishedBooks, hasBookCover } from "@/lib/server/marketing-queries";

export const metadata = {
  title: "বই | AIM Survey Engineering Coaching",
  description: "সার্ভে ইঞ্জিনিয়ারিং প্রস্তুতির বই ও PDF রিসোর্স।",
};

export default async function BooksPage() {
  const books = await getPublishedBooks();

  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">বই ও রিসোর্স</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">সার্ভে ইঞ্জিনিয়ারিং বই</h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            MCQ ব্যাংক, written গাইড ও সার্ভে ইঞ্জিনিয়ারিং রেফারেন্স বই।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 sm:grid-cols-2">
          {books.length === 0 ? (
            <p className="text-muted sm:col-span-2">শীঘ্রই নতুন বই যোগ করা হবে।</p>
          ) : (
            books.map((book) => (
              <article
                key={book.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
              >
                <div className="flex gap-4 p-6 pb-0">
                  {hasBookCover(book) ? (
                    <img
                      src={`/api/books/${book.id}/cover`}
                      alt={book.title}
                      className="h-28 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                      <BookOpen size={32} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold">{book.title}</p>
                      {!book.inStock ? <Badge tone="danger">স্টক আউট</Badge> : null}
                    </div>
                    {book.author ? (
                      <p className="text-xs text-muted">{book.author}</p>
                    ) : null}
                    <p className="mt-2 text-lg font-semibold text-primary">
                      {formatPriceBdt(book.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 pt-4">
                  {book.description ? (
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
                      {book.description}
                    </p>
                  ) : null}
                  {book.orderDetails ? (
                    <p className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-muted">
                      {book.orderDetails}
                    </p>
                  ) : null}
                  <ContactOrderButton outOfStock={!book.inStock} />
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mx-auto mt-10 max-w-6xl px-4 text-center sm:px-6">
          <Link
            href={site.loginPath}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ভর্তিকৃত শিক্ষার্থী পোর্টাল →
          </Link>
        </div>
      </section>
    </>
  );
}
