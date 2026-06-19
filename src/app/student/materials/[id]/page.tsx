"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ImageViewer } from "@/components/secure/ImageViewer";
import { PdfViewer } from "@/components/secure/PdfViewer";
import { SecureViewerShell } from "@/components/secure/SecureViewerShell";
import { Button } from "@/components/ui";

type Material = {
  id: string;
  title: string;
  fileName: string;
  fileType: "PDF" | "IMAGE";
  course: { title: string };
};

type User = {
  name: string;
  email: string;
};

export default function MaterialViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [materialId, setMaterialId] = useState("");
  const [material, setMaterial] = useState<Material | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setMaterialId(id);

      Promise.all([
        fetch(`/api/student/materials/${id}`).then((r) => r.json()),
        fetch("/api/auth/me").then((r) => r.json()),
      ])
        .then(([materialRes, userRes]) => {
          if (!materialRes.material) {
            setError("Material not found or access denied.");
            return;
          }
          setMaterial(materialRes.material);
          setUser(userRes.user);
        })
        .catch(() => setError("Unable to load material."))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const watermark = user ? `${user.name} · ${user.email}` : "AIM Coaching";
  const fileUrl = materialId
    ? `/api/student/materials/${materialId}/file`
    : "";

  return (
    <MobileShell
      title={material?.title || "Study Material"}
      subtitle={material ? `${material.course.title} · View only` : undefined}
      showNav={false}
    >
      {loading ? (
        <p className="text-center text-sm text-muted">Opening secure viewer...</p>
      ) : error || !material ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-danger">{error || "Not found"}</p>
          <Button fullWidth onClick={() => router.push("/student/materials")}>
            Back to materials
          </Button>
        </div>
      ) : (
        <SecureViewerShell>
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Protected view — downloading, copying, and screenshots are restricted.
            Content is watermarked with your account.
          </div>

          {material.fileType === "PDF" ? (
            <PdfViewer url={fileUrl} watermark={watermark} />
          ) : (
            <ImageViewer url={fileUrl} watermark={watermark} />
          )}

          <Button
            variant="secondary"
            fullWidth
            className="mt-4"
            onClick={() => router.push("/student/materials")}
          >
            Close viewer
          </Button>
        </SecureViewerShell>
      )}
    </MobileShell>
  );
}
