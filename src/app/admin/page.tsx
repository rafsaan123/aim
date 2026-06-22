import Link from "next/link";
import { AdminShell } from "@/components/mobile/AdminShell";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { AttemptStatus, Role } from "@/generated/prisma/client";
import { requireAdminPage } from "@/lib/server/page-auth";

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();

  const [students, courses, materials, tests, pendingGrading] =
    await Promise.all([
      db.user.count({ where: { role: Role.STUDENT } }),
      db.course.count(),
      db.studyMaterial.count(),
      db.test.count(),
      db.testAttempt.count({
        where: { status: AttemptStatus.SUBMITTED },
      }),
    ]);

  const stats = [
    { label: "Students", value: students, href: "/admin/users" },
    { label: "Courses", value: courses, href: "/admin/courses" },
    { label: "Materials", value: materials, href: "/admin/materials" },
    { label: "Tests", value: tests, href: "/admin/tests" },
  ];

  return (
    <AdminShell title={`Hello, ${session.name}`}>
      <p className="mb-4 text-sm text-muted">
        Manage students, courses, study materials, tests, and grading from here.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="text-center transition active:scale-[0.98]">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {pendingGrading > 0 ? (
        <Link href="/admin/grading" className="mt-4 block">
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
    </AdminShell>
  );
}
