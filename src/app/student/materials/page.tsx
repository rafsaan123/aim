import Link from "next/link";
import { FileImage, FileText } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { getStudentMaterials } from "@/lib/server/student-queries";

export default async function StudentMaterialsPage() {
  const materials = await getStudentMaterials();

  return (
    <MobileShell
      title="Study Materials"
      subtitle="PDFs and images with your account watermark"
    >
      {materials.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Study materials will appear here once your admin uploads PDFs or images."
        />
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <Card key={material.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  {material.fileType === "PDF" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <FileImage className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Badge>{material.course.title}</Badge>
                  <h3 className="mt-2 font-semibold">{material.title}</h3>
                  <p className="mt-1 truncate text-xs text-muted">
                    {material.fileName}
                  </p>
                  <Link href={`/student/materials/${material.id}`} className="mt-3 block">
                    <Button fullWidth>Open viewer</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MobileShell>
  );
}
