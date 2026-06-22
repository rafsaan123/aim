import { MobileShell } from "@/components/mobile/MobileShell";
import { LogoutButton } from "@/components/student/LogoutButton";
import { Card } from "@/components/ui";
import { requireStudentPage } from "@/lib/server/page-auth";

export default async function StudentProfilePage() {
  const user = await requireStudentPage();

  return (
    <MobileShell title="Profile" subtitle="Your account details">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        <Card>
          <p className="text-sm font-medium">Account type</p>
          <p className="mt-1 text-muted">Student</p>
        </Card>

        <LogoutButton />
      </div>
    </MobileShell>
  );
}
