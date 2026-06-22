"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(
        data.user.role === "ADMIN" ? "/admin" : "/student/materials"
      );
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1f3a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, #2563eb 0%, transparent 45%), radial-gradient(circle at 80% 0%, #ea580c 0%, transparent 35%)",
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-32 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10 safe-top safe-bottom">
        <Link
          href="/"
          className="mb-6 text-center text-sm text-blue-100/70 transition hover:text-white"
        >
          ← হোমে ফিরুন
        </Link>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
            <Image
              src="/brand/aim-logo.png"
              alt="AIM Engineering Job Coaching"
              width={192}
              height={192}
              priority
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
            AIM Engineering Job Coaching
          </h1>
          <p className="mt-2 text-sm font-semibold text-amber-300">
            Learn for Built to Future
          </p>
          <p className="mt-3 text-sm text-blue-100/80">
            Sign in to access courses, materials, and tests
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur-sm"
        >
          <Field label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-blue-100/60">
          Demo: admin@aim.com / admin123 · student@aim.com / student123
        </p>
      </div>
    </div>
  );
}
