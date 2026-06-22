import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminLayoutShell";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/server/page-auth";

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();

  const [students, courses, materials, tests, pendingGrading, books] =
    await Promise.all([
      db.user.count({ where: { role: Role.STUDENT } }),
      db.course.count(),
      db.studyMaterial.count(),
      db.test.count(),
      db.testAttempt.count({ where: { status: AttemptStatus.SUBMITTED } }),
      db.book.count(),
    ]);

  const stats = [
    { label: "Students", value: students, href: "/admin/users" },
    { label: "Courses", value: courses, href: "/admin/courses" },
    { label: "Books", value: books, href: "/admin/books" },
    { label: "Materials", value: materials, href: "/admin/materials" },
    { label: "Tests", value: tests, href: "/admin/tests" },
  ];

  return (
    <>
      <AdminPageHeader
        title={`Hello, ${session.name}`}
        description="Survey engineering coaching — website content and LMS in one place."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition hover:border-primary/30 hover:shadow-md">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {pendingGrading > 0 ? (
        <Link href="/admin/grading" className="mt-6 block">
          <Card className="border-amber-200 bg-amber-50">
            <p className="font-semibold text-amber-800">
              {pendingGrading} test(s) need manual grading
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Review short-answer responses and publish results.
            </p>
          </Card>
        </Link>
      ) : null}
    </>
  );
}
