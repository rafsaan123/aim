"use client";

import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Badge, Card, EmptyState } from "@/components/ui";

type Material = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  course: { id: string; title: string };
};

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/materials")
      .then((r) => r.json())
      .then((d) => setMaterials(d.materials || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell
      title="Study Materials"
      subtitle="Notes and resources for your enrolled courses"
    >
      {loading ? (
        <p className="text-center text-sm text-muted">Loading materials...</p>
      ) : materials.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Study materials will appear here once your admin adds them to your courses."
        />
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <Card key={material.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge>{material.course.title}</Badge>
                  <h3 className="mt-2 font-semibold">{material.title}</h3>
                </div>
              </div>
              <p
                className={`mt-2 text-sm text-muted whitespace-pre-wrap ${
                  expanded === material.id ? "" : "line-clamp-3"
                }`}
              >
                {material.content}
              </p>
              <button
                type="button"
                onClick={() =>
                  setExpanded(expanded === material.id ? null : material.id)
                }
                className="mt-2 text-sm font-medium text-primary"
              >
                {expanded === material.id ? "Show less" : "Read more"}
              </button>
            </Card>
          ))}
        </div>
      )}
    </MobileShell>
  );
}
