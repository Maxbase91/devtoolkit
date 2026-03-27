"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/pdf-utils";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

interface FileEntry {
  id: string;
  file: File;
  previewUrl: string;
  result: ConvertedResult | null;
}

interface ConvertedResult {
  blob: Blob;
  originalSize: number;
  convertedSize: number;
}

const FORMAT_OPTIONS: { label: string; value: OutputFormat }[] = [
  { label: "PNG", value: "image/png" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "WebP", value: "image/webp" },
];

function getExtension(mime: OutputFormat): string {
  const map: Record<OutputFormat, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };
  return map[mime];
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      mime,
      quality,
    );
  });
}

export default function ImageFormatConverter() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    const newEntries: FileEntry[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      result: null,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const convertAll = useCallback(async () => {
    if (entries.length === 0) return;
    setIsConverting(true);

    const qualityParam =
      format === "image/png" ? undefined : quality / 100;

    const updated = await Promise.all(
      entries.map(async (entry) => {
        try {
          const img = await loadImageFromFile(entry.file);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          const blob = await canvasToBlob(canvas, format, qualityParam);

          return {
            ...entry,
            result: {
              blob,
              originalSize: entry.file.size,
              convertedSize: blob.size,
            },
          };
        } catch {
          return entry;
        }
      }),
    );

    setEntries(updated);
    setIsConverting(false);
  }, [entries, format, quality]);

  const showQuality = format === "image/jpeg" || format === "image/webp";

  return (
    <div className="space-y-6">
      <FileDropZone
        accept="image/*"
        multiple
        onFiles={handleFiles}
        label="Drop images here or click to browse"
        sublabel="Supports multiple files"
      />

      {entries.length > 0 && (
        <>
          {/* Controls */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Format selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">
                Output Format
              </label>
              <div className="flex rounded-md border border-border text-sm">
                {FORMAT_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setFormat(value)}
                    className={cn(
                      "flex-1 px-2 py-1.5 font-medium transition-colors",
                      format === value
                        ? "bg-accent text-white"
                        : "hover:bg-surface",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider */}
            {showQuality && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-muted">Quality</label>
                  <span className="font-mono text-foreground">{quality}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--color-accent)]"
                />
              </div>
            )}
          </div>

          {/* Convert button */}
          <button
            onClick={convertAll}
            disabled={isConverting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isConverting ? "Converting..." : "Convert All"}
          </button>

          {/* File list */}
          <div className="space-y-3">
            {entries.map((entry) => {
              const pctChange = entry.result
                ? Math.round(
                    ((entry.result.convertedSize - entry.result.originalSize) /
                      entry.result.originalSize) *
                      100,
                  )
                : null;

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
                >
                  {/* Thumbnail */}
                  <img
                    src={entry.previewUrl}
                    alt={entry.file.name}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entry.file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      <span>{formatBytes(entry.file.size)}</span>
                      {entry.result && (
                        <>
                          <span>&rarr;</span>
                          <span className="font-medium text-foreground">
                            {formatBytes(entry.result.convertedSize)}
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              pctChange !== null && pctChange <= 0
                                ? "text-success"
                                : "text-error",
                            )}
                          >
                            ({pctChange !== null && pctChange > 0 ? "+" : ""}
                            {pctChange}%)
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
                        filename={`${entry.file.name.replace(/\.[^.]+$/, "")}.${getExtension(format)}`}
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
