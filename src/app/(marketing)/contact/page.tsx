import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/public/ContactForm";
import { site } from "@/lib/marketing-content";

export const metadata = {
  title: "যোগাযোগ | AIM Engineering Job Coaching",
  description: "AIM Engineering Job Coaching-এর সাথে যোগাযোগ করুন।",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#0b1f3a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-amber-300">যোগাযোগ</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">আমাদের সাথে কথা বলুন</h1>
          <p className="mt-4 max-w-2xl text-blue-100/85">
            কোর্স, ভর্তি বা যেকোনো প্রশ্ন — বার্তা পাঠান, আমরা ফিরে যোগাযোগ করব।
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-indigo-50 p-3 text-primary">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">ইমেইল</p>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-1 block text-sm text-primary hover:underline"
                  >
                    {site.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-indigo-50 p-3 text-primary">
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">ঠিকানা</p>
                  <p className="mt-1 text-sm text-muted">{site.address}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary to-indigo-800 p-6 text-white">
              <p className="font-semibold">শিক্ষার্থী পোর্টাল</p>
              <p className="mt-2 text-sm text-blue-100">
                ইতিমধ্যে অ্যাকাউন্ট আছে? ম্যাটেরিয়াল ও টেস্টের জন্য লগইন করুন।
              </p>
              <a
                href={site.loginPath}
                className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary"
              >
                লগইন করুন
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:col-span-3">
            <h2 className="text-lg font-bold text-foreground">বার্তা পাঠান</h2>
            <p className="mt-1 text-sm text-muted">সব তথ্য পূরণ করে জমা দিন</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
