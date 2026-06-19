"use client";

import { useEffect, useState } from "react";
import { fetchMaterialFile } from "@/lib/fetch-material-file";
import { WatermarkOverlay } from "./WatermarkOverlay";

type ImageViewerProps = {
  url: string;
  watermark: string;
};

export function ImageViewer({ url, watermark }: ImageViewerProps) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function loadImage() {
      try {
        const buffer = await fetchMaterialFile(url);
        if (cancelled || !canvasEl) return;

        const blob = new Blob([buffer]);
        const objectUrl = URL.createObjectURL(blob);

        try {
          const img = new Image();
          img.src = objectUrl;

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Invalid image file"));
          });

          if (cancelled || !canvasEl) return;

          const maxWidth = Math.min(window.innerWidth - 32, 720);
          const scale =
            img.width > 0 ? Math.min(1, maxWidth / img.width) : 1;
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));

          canvasEl.width = width;
          canvasEl.height = height;

          const ctx = canvasEl.getContext("2d");
          if (!ctx) throw new Error("Canvas unavailable");

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load image."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (canvasEl) {
      loadImage();
    }

    return () => {
      cancelled = true;
    };
  }, [url, canvasEl]);

  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-xl bg-white shadow-inner">
      {loading ? (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          Loading image...
        </p>
      ) : null}
      {error ? (
        <p className="px-4 py-12 text-center text-sm text-danger">{error}</p>
      ) : (
        <>
          <canvas
            ref={setCanvasEl}
            className="mx-auto block max-w-full touch-none"
          />
          {!loading ? <WatermarkOverlay label={watermark} /> : null}
        </>
      )}
    </div>
  );
}
