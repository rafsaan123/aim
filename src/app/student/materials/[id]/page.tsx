"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { ImageViewer } from "@/components/secure/ImageViewer";
import { PdfViewer } from "@/components/secure/PdfViewer";
import { SecureViewerShell } from "@/components/secure/SecureViewerShell";
import { Button } from "@/components/ui";
import { Download } from "lucide-react";

type Material = {
  id: string;
  title: string;
  description: string | null;
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
  const [downloading, setDownloading] = useState(false);
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

  async function handleDownload() {
    if (!materialId || !material) return;

    setDownloading(true);
    try {
      const res = await fetch(
        `/api/student/materials/${materialId}/download`,
        { credentials: "include" }
      );

      if (!res.ok) {
        setError("Download failed. Please try again.");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] || `watermarked-${material.fileName}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <MobileShell
      title={material?.title || "Study Material"}
      subtitle={
        material ? `${material.course.title} · Watermarked copy` : undefined
      }
      showNav={false}
    >
      {loading ? (
        <p className="text-center text-sm text-muted">Opening viewer...</p>
      ) : error || !material ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-danger">{error || "Not found"}</p>
          <Button fullWidth onClick={() => router.push("/student/materials")}>
            Back to materials
          </Button>
        </div>
      ) : (
        <SecureViewerShell>
          <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
            Content is watermarked with your name and email. Downloads include
            the same watermark embedded in the file.
          </div>

          {material.description ? (
            <div className="mb-4 rounded-xl border border-border bg-white p-4 text-sm leading-relaxed text-foreground">
              {material.description}
            </div>
          ) : null}

          {material.fileType === "PDF" ? (
            <PdfViewer url={fileUrl} watermark={watermark} />
          ) : (
            <ImageViewer url={fileUrl} watermark={watermark} />
          )}

          <Button
            fullWidth
            className="mt-4"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing download..." : "Download watermarked copy"}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            className="mt-3"
            onClick={() => router.push("/student/materials")}
          >
            Close viewer
          </Button>
        </SecureViewerShell>
      )}
    </MobileShell>
  );
}
