"use client";

import { useState, useCallback } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { ArrowUp, ArrowDown, RotateCw, Trash2 } from "lucide-react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";
import { formatBytes } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";

async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

interface PageEntry {
  originalIndex: number;
  rotation: number;
  thumbnailUrl: string;
}

export default function PdfReorder() {
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [sourceBuffer, setSourceBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsLoadingThumbs(true);
    setError(null);
    setPages([]);
    setOutputBlob(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await getPdfjs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const entries: PageEntry[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 0.3;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        const thumbnailUrl = canvas.toDataURL();

        entries.push({
          originalIndex: i - 1,
          rotation: 0,
          thumbnailUrl,
        });
      }

      setSourceBuffer(arrayBuffer);
      setFileName(file.name);
      setFileSize(file.size);
      setTotalPages(pdf.numPages);
      setPages(entries);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process PDF";
      if (message.toLowerCase().includes("password")) {
        setError("This PDF is encrypted or password-protected.");
      } else {
        setError(`Failed to load PDF: ${message}`);
      }
    } finally {
      setIsLoadingThumbs(false);
    }
  }, []);

  function moveUp(index: number) {
    if (index === 0) return;
    setPages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setOutputBlob(null);
  }

  function moveDown(index: number) {
    setPages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setOutputBlob(null);
  }

  function rotatePage(index: number) {
    setPages((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
    setOutputBlob(null);
  }

  function deletePage(index: number) {
    setPages((prev) => prev.filter((_, i) => i !== index));
    setOutputBlob(null);
  }

  async function handleSave() {
    if (!sourceBuffer || pages.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const sourceDoc = await PDFDocument.load(sourceBuffer);
      const newDoc = await PDFDocument.create();

      for (const page of pages) {
        const [copied] = await newDoc.copyPages(sourceDoc, [
          page.originalIndex,
        ]);
        copied.setRotation(degrees(page.rotation));
        newDoc.addPage(copied);
      }

      const bytes = await newDoc.save();
      setOutputBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save PDF";
      setError(`Failed to rebuild PDF: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setPages([]);
    setSourceBuffer(null);
    setFileName("");
    setFileSize(0);
    setTotalPages(0);
    setOutputBlob(null);
    setError(null);
  }

  const outputFilename = fileName
    ? fileName.replace(/\.pdf$/i, "-reordered.pdf")
    : "reordered.pdf";

  if (isLoadingThumbs) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-surface p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-muted">Generating thumbnails...</p>
      </div>
    );
  }

  if (error && pages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-error/30 bg-error/5 p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
        <button
          onClick={handleReset}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Try another file
        </button>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <FileDropZone
        accept=".pdf"
        onFiles={handleFiles}
        label="Drop a PDF here or click to browse"
        sublabel="Reorder, rotate, or remove pages"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface px-4 py-3 text-sm">
        <span className="text-muted">
          File:{" "}
          <span className="font-medium text-foreground">{fileName}</span>
        </span>
        <span className="text-muted">
          Size:{" "}
          <span className="font-medium text-foreground">
            {formatBytes(fileSize)}
          </span>
        </span>
        <span className="text-muted">
          Pages:{" "}
          <span className="font-medium text-foreground">
            {pages.length} of {totalPages}
          </span>
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-error/30 bg-error/5 p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pages.map((page, index) => (
          <div
            key={`${page.originalIndex}-${index}`}
            className="rounded-md border border-border bg-surface p-2"
          >
            {/* Thumbnail */}
            <div className="mb-2 flex items-center justify-center overflow-hidden rounded bg-background p-1">
              <img
                src={page.thumbnailUrl}
                alt={`Page ${page.originalIndex + 1}`}
                className="max-h-40 object-contain"
                style={{ transform: `rotate(${page.rotation}deg)` }}
              />
            </div>

            {/* Page label */}
            <p className="mb-2 text-center text-xs text-muted">
              Page {page.originalIndex + 1}
              {page.rotation > 0 && (
                <span className="ml-1 text-accent">{page.rotation}deg</span>
              )}
            </p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                title="Move up"
                className={cn(
                  "rounded p-1.5 transition-colors",
                  "hover:bg-background disabled:cursor-not-allowed disabled:opacity-30"
                )}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === pages.length - 1}
                title="Move down"
                className={cn(
                  "rounded p-1.5 transition-colors",
                  "hover:bg-background disabled:cursor-not-allowed disabled:opacity-30"
                )}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => rotatePage(index)}
                title="Rotate 90deg"
                className="rounded p-1.5 transition-colors hover:bg-background"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deletePage(index)}
                title="Remove page"
                className="rounded p-1.5 text-error transition-colors hover:bg-error/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || pages.length === 0}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save PDF"}
        </button>
        <BlobDownloadButton blob={outputBlob} filename={outputFilename} />
        <button
          onClick={handleReset}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
