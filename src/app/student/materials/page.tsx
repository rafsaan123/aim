import Link from "next/link";
import { FileImage, FileText } from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { CourseFilterBanner } from "@/components/student/CourseFilterBanner";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { getStudentMaterials } from "@/lib/server/student-queries";

type Props = { searchParams: Promise<{ course?: string }> };

export default async function StudentMaterialsPage({ searchParams }: Props) {
  const { course: courseId } = await searchParams;
  const allMaterials = await getStudentMaterials();
  const materials = courseId
    ? allMaterials.filter((m) => m.course.id === courseId)
    : allMaterials;
  const filterTitle = courseId
    ? allMaterials.find((m) => m.course.id === courseId)?.course.title
    : null;

  return (
    <MobileShell title="Materials">
      {filterTitle ? (
        <CourseFilterBanner courseTitle={filterTitle} clearHref="/student/materials" />
      ) : null}

      {materials.length === 0 ? (
        <EmptyState
          title="No materials"
          description={
            courseId
              ? "No materials for this course yet."
              : "Materials will appear here when available."
          }
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
                  {!courseId ? <Badge>{material.course.title}</Badge> : null}
                  <h3 className={`font-semibold ${!courseId ? "mt-2" : ""}`}>
                    {material.title}
                  </h3>
                  <Link href={`/student/materials/${material.id}`} className="mt-3 block">
                    <Button fullWidth>Open</Button>
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
