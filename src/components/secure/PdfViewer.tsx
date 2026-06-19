"use client";

import { useEffect, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { fetchMaterialFile } from "@/lib/fetch-material-file";
import { WatermarkOverlay } from "./WatermarkOverlay";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type PdfViewerProps = {
  url: string;
  watermark: string;
};

export function PdfViewer({ url, watermark }: PdfViewerProps) {
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setPdfDoc(null);
    setPage(1);
    setTotalPages(0);
    setLoading(true);
    setError("");

    async function loadPdf() {
      try {
        const data = await fetchMaterialFile(url);
        if (cancelled) return;

        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPage(1);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load PDF."
          );
        }
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
    if (!pdfDoc || !canvasEl) return;

    let cancelled = false;

    async function renderPage() {
      try {
        const pdfPage = await pdfDoc!.getPage(page);
        if (cancelled) return;

        const viewport = pdfPage.getViewport({ scale: 1.5 });
        const context = canvasEl!.getContext("2d");
        if (!context) return;

        canvasEl!.width = viewport.width;
        canvasEl!.height = viewport.height;

        await pdfPage.render({
          canvas: canvasEl!,
          canvasContext: context,
          viewport,
        }).promise;
      } catch {
        if (!cancelled) setError("Unable to render PDF page.");
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, page, canvasEl]);

  return (
    <div className="relative">
      <div className="relative min-h-[240px] overflow-x-auto rounded-xl bg-white shadow-inner">
        {loading ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            Loading document...
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

      {!error && totalPages > 1 ? (
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
