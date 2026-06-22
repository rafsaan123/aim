import { MobileShell } from "@/components/mobile/MobileShell";
import { LogoutButton } from "@/components/student/LogoutButton";
import { Card } from "@/components/ui";
import { requireStudentPage } from "@/lib/server/page-auth";

export default async function StudentProfilePage() {
  const user = await requireStudentPage();

  return (
    <MobileShell title="Profile">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1f3a] text-xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{user.name}</h2>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </MobileShell>
  );
}
