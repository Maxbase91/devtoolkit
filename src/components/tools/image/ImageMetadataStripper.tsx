"use client";

import { useState, useCallback } from "react";
import { X, Download } from "lucide-react";
import { formatBytes } from "@/lib/pdf-utils";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";

interface FileEntry {
  id: string;
  file: File;
  width: number;
  height: number;
  result: StrippedResult | null;
}

interface StrippedResult {
  blob: Blob;
  originalSize: number;
  strippedSize: number;
}

function getMimeType(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  if (file.type === "image/gif") return "image/gif";
  return "image/png";
}

function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "png";
}

function loadImageFromFile(
  file: File,
): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load: ${file.name}`));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      mime,
    );
  });
}

export default function ImageMetadataStripper() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [isStripping, setIsStripping] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const newEntries: FileEntry[] = [];

    for (const file of files) {
      try {
        const { img, url } = await loadImageFromFile(file);
        newEntries.push({
          id: crypto.randomUUID(),
          file,
          width: img.width,
          height: img.height,
          result: null,
        });
        URL.revokeObjectURL(url);
      } catch {
        // Skip files that fail to load
      }
    }

    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const stripAll = useCallback(async () => {
    if (entries.length === 0) return;
    setIsStripping(true);

    const updated = await Promise.all(
      entries.map(async (entry) => {
        try {
          const { img, url } = await loadImageFromFile(entry.file);

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          const mime = getMimeType(entry.file);
          const blob = await canvasToBlob(canvas, mime);

          return {
            ...entry,
            result: {
              blob,
              originalSize: entry.file.size,
              strippedSize: blob.size,
            },
          };
        } catch {
          return entry;
        }
      }),
    );

    setEntries(updated);
    setIsStripping(false);
  }, [entries]);

  const downloadAll = useCallback(() => {
    for (const entry of entries) {
      if (!entry.result) continue;
      const mime = getMimeType(entry.file);
      const ext = getExtension(mime);
      const baseName = entry.file.name.replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(entry.result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName}-clean.${ext}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }
  }, [entries]);

  const hasResults = entries.some((e) => e.result !== null);

  return (
    <div className="space-y-6">
      <FileDropZone
        accept="image/*"
        multiple
        onFiles={handleFiles}
        label="Drop images here or click to browse"
        sublabel="EXIF, GPS, and other metadata will be removed"
      />

      {entries.length > 0 && (
        <>
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={stripAll}
              disabled={isStripping}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {isStripping ? "Stripping..." : "Strip All"}
            </button>
            {hasResults && (
              <button
                onClick={downloadAll}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
              >
                <Download className="h-3.5 w-3.5" />
                Download All
              </button>
            )}
          </div>

          {/* File list */}
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
              >
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.file.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span>{entry.file.type || "unknown"}</span>
                    <span>|</span>
                    <span>
                      {entry.width} x {entry.height}
                    </span>
                    <span>|</span>
                    <span>{formatBytes(entry.file.size)}</span>
                    {entry.result && (
                      <>
                        <span>&rarr;</span>
                        <span className="font-medium text-foreground">
                          {formatBytes(entry.result.strippedSize)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {entry.result && (
                    <BlobDownloadButton
                      blob={entry.result.blob}
                      filename={`${entry.file.name.replace(/\.[^.]+$/, "")}-clean.${getExtension(getMimeType(entry.file))}`}
                    />
                  )}
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="rounded-md border border-border p-1.5 text-muted transition-colors hover:bg-background hover:text-error"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
