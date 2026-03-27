"use client";

import { useState, useCallback, useMemo } from "react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";
import { formatBytes } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

interface ImageEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  type: string;
}

type PageSize = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";
type Margin = "none" | "small" | "medium";

const PAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const MARGIN_VALUES: Record<Margin, number> = {
  none: 0,
  small: 20,
  medium: 40,
};

function createImageEntry(file: File): ImageEntry {
  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    size: file.size,
    previewUrl: URL.createObjectURL(file),
    type: file.type,
  };
}

async function convertWebpToPng(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to create canvas context");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });

  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

export default function ImagesToPdf() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<Margin>("small");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    setError(null);
    setResultBlob(null);
    const entries = newFiles.map(createImageEntry);
    setImages((prev) => [...prev, ...entries]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const entry = prev.find((img) => img.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
    setResultBlob(null);
  }, []);

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setResultBlob(null);
  }, []);

  const showOrientation = pageSize !== "fit";

  const pageSizeOptions: { value: PageSize; label: string }[] = [
    { value: "a4", label: "A4" },
    { value: "letter", label: "Letter" },
    { value: "fit", label: "Fit to Image" },
  ];

  const orientationOptions: { value: Orientation; label: string }[] = [
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
  ];

  const marginOptions: { value: Margin; label: string }[] = [
    { value: "none", label: "None" },
    { value: "small", label: "Small (20pt)" },
    { value: "medium", label: "Medium (40pt)" },
  ];

  const handleConvert = useCallback(async () => {
    if (images.length === 0) return;
    setError(null);
    setProcessing(true);
    setResultBlob(null);

    try {
      const doc = await PDFDocument.create();
      const marginPt = MARGIN_VALUES[margin];

      for (const entry of images) {
        const buffer = await entry.file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        let embedded;
        const isJpeg = entry.type === "image/jpeg";
        const isPng = entry.type === "image/png";
        const isWebp = entry.type === "image/webp";

        if (isJpeg) {
          embedded = await doc.embedJpg(bytes);
        } else if (isPng) {
          embedded = await doc.embedPng(bytes);
        } else if (isWebp) {
          const pngBytes = await convertWebpToPng(entry.file);
          embedded = await doc.embedPng(pngBytes);
        } else {
          throw new Error(`Unsupported image type: ${entry.type}`);
        }

        const imgWidth = embedded.width;
        const imgHeight = embedded.height;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "fit") {
          pageWidth = imgWidth + marginPt * 2;
          pageHeight = imgHeight + marginPt * 2;
        } else {
          const dims = PAGE_DIMENSIONS[pageSize];
          if (orientation === "landscape") {
            pageWidth = dims.height;
            pageHeight = dims.width;
          } else {
            pageWidth = dims.width;
            pageHeight = dims.height;
          }
        }

        const drawableWidth = pageWidth - marginPt * 2;
        const drawableHeight = pageHeight - marginPt * 2;

        let drawWidth: number;
        let drawHeight: number;

        if (pageSize === "fit") {
          drawWidth = imgWidth;
          drawHeight = imgHeight;
        } else {
          const scaleX = drawableWidth / imgWidth;
          const scaleY = drawableHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          drawWidth = imgWidth * scale;
          drawHeight = imgHeight * scale;
        }

        const xOffset = marginPt + (drawableWidth - drawWidth) / 2;
        const yOffset = marginPt + (drawableHeight - drawHeight) / 2;

        const page = doc.addPage([pageWidth, pageHeight]);
        page.drawImage(embedded, {
          x: xOffset,
          y: yOffset,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      setError(`Conversion failed: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  }, [images, pageSize, orientation, margin]);

  const totalSize = useMemo(
    () => images.reduce((sum, img) => sum + img.size, 0),
    [images]
  );

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <FileDropZone
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          onFiles={handleFiles}
          label="Drop images here or click to browse"
          sublabel="Supports JPEG, PNG, and WebP"
        />
        {error && (
          <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted">
            {images.length} image{images.length !== 1 ? "s" : ""} &middot; {formatBytes(totalSize)}
          </label>
        </div>

        <div className="rounded-md border border-border bg-surface divide-y divide-border">
          {images.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-3 py-2"
            >
              <img
                src={entry.previewUrl}
                alt={entry.name}
                className="h-10 w-10 shrink-0 rounded border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {entry.name}
                </p>
                <p className="text-xs text-muted">{formatBytes(entry.size)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-muted transition-colors hover:bg-background disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded p-1 text-muted transition-colors hover:bg-background disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeImage(entry.id)}
                  className="rounded p-1 text-muted transition-colors hover:text-error hover:bg-error/5"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add more via drop zone */}
        <FileDropZone
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          onFiles={handleFiles}
          label="Add more images"
          className="py-4"
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted">Options</label>
        <div className="flex flex-wrap gap-4">
          {/* Page size */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted">Page Size</label>
            <div className="flex rounded-md border border-border text-sm">
              {pageSizeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPageSize(opt.value)}
                  className={cn(
                    "px-3 py-1.5 font-medium transition-colors",
                    pageSize === opt.value
                      ? "bg-accent text-white"
                      : "hover:bg-background"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          {showOrientation && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted">Orientation</label>
              <div className="flex rounded-md border border-border text-sm">
                {orientationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setOrientation(opt.value)}
                    className={cn(
                      "px-3 py-1.5 font-medium transition-colors",
                      orientation === opt.value
                        ? "bg-accent text-white"
                        : "hover:bg-background"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Margin */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted">Margin</label>
            <div className="flex rounded-md border border-border text-sm">
              {marginOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMargin(opt.value)}
                  className={cn(
                    "px-3 py-1.5 font-medium transition-colors",
                    margin === opt.value
                      ? "bg-accent text-white"
                      : "hover:bg-background"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleConvert}
          disabled={images.length === 0 || processing}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-accent text-white hover:bg-accent/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Converting..." : "Convert to PDF"}
        </button>

        {resultBlob && (
          <BlobDownloadButton blob={resultBlob} filename="images.pdf" />
        )}
      </div>
    </div>
  );
}
