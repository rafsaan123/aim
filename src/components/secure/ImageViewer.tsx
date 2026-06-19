"use client";

import { useEffect, useRef, useState } from "react";
import { WatermarkOverlay } from "./WatermarkOverlay";

type ImageViewerProps = {
  url: string;
  watermark: string;
};

export function ImageViewer({ url, watermark }: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadImage() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load image");

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Invalid image"));
        });

        if (cancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const maxWidth = Math.min(window.innerWidth - 32, 720);
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } catch {
        if (!cancelled) setError("Unable to load image.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadImage();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-muted">Loading image...</p>
    );
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-danger">{error}</p>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-inner">
      <canvas
        ref={canvasRef}
        className="mx-auto block max-w-full touch-none"
      />
      <WatermarkOverlay label={watermark} />
    </div>
  );
}
