"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Button, Card } from "@/components/ui";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <MobileShell title="Profile" subtitle="Your account details">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
            {user?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.name || "Student"}</h2>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        <Card>
          <p className="text-sm font-medium">Account type</p>
          <p className="mt-1 text-muted">Student</p>
        </Card>

        <Button variant="danger" fullWidth onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </MobileShell>
  );
}
