"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">আপনার বার্তা পাঠানো হয়েছে!</p>
        <p className="mt-2 text-sm text-emerald-700">
          শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="নাম">
        <Input name="name" placeholder="আপনার নাম" required />
      </Field>
      <Field label="ফোন">
        <Input name="phone" type="tel" placeholder="01XXXXXXXXX" required />
      </Field>
      <Field label="ইমেইল">
        <Input name="email" type="email" placeholder="you@example.com" />
      </Field>
      <Field label="বার্তা">
        <Textarea name="message" rows={5} placeholder="আপনার প্রশ্ন বা মন্তব্য..." required />
      </Field>
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
      </Button>
    </form>
  );
}
