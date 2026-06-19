"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { WatermarkOverlay } from "./WatermarkOverlay";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfViewerProps = {
  url: string;
  watermark: string;
};

export function PdfViewer({ url, watermark }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError("");

      try {
        const doc = await pdfjs.getDocument({
          url,
          withCredentials: true,
        }).promise;

        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPage(1);
      } catch {
        if (!cancelled) setError("Unable to load PDF.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    async function renderPage() {
      const canvas = canvasRef.current;
      if (!canvas || !pdfDoc) return;

      const pdfPage = await pdfDoc.getPage(page);
      if (cancelled) return;

      const viewport = pdfPage.getViewport({ scale: 1.4 });
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await pdfPage.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, page]);

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-muted">Loading document...</p>
    );
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-danger">{error}</p>;
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto rounded-xl bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          className="mx-auto block max-w-full touch-none"
        />
        <WatermarkOverlay label={watermark} />
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
