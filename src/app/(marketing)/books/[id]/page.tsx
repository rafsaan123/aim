import { PageLink } from "@/components/public/PageLink";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { formatPriceBdt } from "@/lib/catalog";
import { ContactOrderButton } from "@/components/public/ContactOrderButton";
import { Badge } from "@/components/ui";
import { site } from "@/lib/marketing-content";
import { getPublishedBookById, hasBookCover } from "@/lib/server/marketing-queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const book = await getPublishedBookById(id);
  if (!book) return { title: "বই পাওয়া যায়নি" };
  return {
    title: `${book.title} | AIM Survey Engineering`,
    description: book.description || book.title,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const book = await getPublishedBookById(id);
  if (!book) notFound();

  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <PageLink
            href="/books"
            className="inline-flex items-center gap-1 text-sm text-blue-100/80 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            সব বই
          </PageLink>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            {hasBookCover(book) ? (
              <img
                src={`/api/books/${book.id}/cover`}
                alt={book.title}
                className="h-48 w-36 shrink-0 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-48 w-36 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <BookOpen size={48} className="text-white/70" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">{book.title}</h1>
                {!book.inStock ? <Badge tone="danger">স্টক আউট</Badge> : null}
              </div>
              {book.author ? (
                <p className="mt-2 text-sm text-blue-100/85">{book.author}</p>
              ) : null}
              <p className="mt-3 text-2xl font-bold text-amber-300">
                {formatPriceBdt(book.price)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-foreground">বই সম্পর্কে</h2>
            {book.description ? (
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">
                {book.description}
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted">বিস্তারিত শীঘ্রই যোগ করা হবে।</p>
            )}

            {book.orderDetails ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  অর্ডার তথ্য
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {book.orderDetails}
                </p>
              </div>
            ) : null}

            <div className="mt-8">
              <ContactOrderButton outOfStock={!book.inStock} />
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            <PageLink href="/books" className="font-semibold text-primary hover:underline">
              ← অন্যান্য বই দেখুন
            </PageLink>
            {" · "}
            <PageLink href={site.loginPath} className="font-semibold text-primary hover:underline">
              শিক্ষার্থী পোর্টাল
            </PageLink>
          </p>
        </div>
      </section>
    </>
  );
}
