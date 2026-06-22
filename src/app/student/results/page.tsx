import { MobileShell } from "@/components/mobile/MobileShell";
import { StudentResultsPanel } from "@/components/student/StudentResultsPanel";
import { getStudentResults } from "@/lib/server/student-queries";
import { toPlain } from "@/lib/server/serialize";

export default async function StudentResultsPage() {
  const results = toPlain(await getStudentResults());

  return (
    <MobileShell title="Results">
      <StudentResultsPanel results={results} />
    </MobileShell>
  );
}
