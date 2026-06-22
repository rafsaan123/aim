import { Phone } from "lucide-react";
import { site } from "@/lib/marketing-content";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function ContactOrderButton({
  label = "অর্ডার করতে কল করুন",
  disabled = false,
  outOfStock = false,
}: {
  label?: string;
  disabled?: boolean;
  outOfStock?: boolean;
}) {
  if (outOfStock || disabled) {
    return (
      <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-center text-sm text-muted">
        স্টক আউট — পরে আবার দেখুন
      </div>
    );
  }

  return (
    <a
      href={phoneHref(site.orderPhone)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98]"
    >
      <Phone size={16} />
      {label} · {site.orderPhoneDisplay}
    </a>
  );
}
