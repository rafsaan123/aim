"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { FileImage, FileText } from "lucide-react";

type Material = {
  id: string;
  title: string;
  fileName: string;
  fileType: "PDF" | "IMAGE";
  createdAt: string;
  course: { id: string; title: string };
};

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/materials")
      .then((r) => r.json())
      .then((d) => setMaterials(d.materials || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell
      title="Study Materials"
      subtitle="PDFs and images with your account watermark"
    >
      {loading ? (
        <p className="text-center text-sm text-muted">Loading materials...</p>
      ) : materials.length === 0 ? (
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
