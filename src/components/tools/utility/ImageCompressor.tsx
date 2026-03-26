"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface CompressedData {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageCompressor() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [compressed, setCompressed] = useState<CompressedData | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal({ file, url, width: img.width, height: img.height });
      setCompressed(null);
    };
    img.src = url;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) loadImage(file);
  };

  const compress = useCallback(async () => {
    if (!original) return;
    setIsCompressing(true);

    const img = new Image();
    img.src = original.url;
    await new Promise((resolve) => { img.onload = resolve; });

    let targetWidth = img.width;
    let targetHeight = img.height;

    const mw = maxWidth ? parseInt(maxWidth, 10) : 0;
    const mh = maxHeight ? parseInt(maxHeight, 10) : 0;

    if (mw && targetWidth > mw) {
      const ratio = mw / targetWidth;
      targetWidth = mw;
      targetHeight = Math.round(targetHeight * ratio);
    }
    if (mh && targetHeight > mh) {
      const ratio = mh / targetHeight;
      targetHeight = mh;
      targetWidth = Math.round(targetWidth * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const qualityParam = format === "image/png" ? undefined : quality / 100;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCompressed({ blob, url, width: targetWidth, height: targetHeight });
        }
        setIsCompressing(false);
      },
      format,
      qualityParam
    );
  }, [original, quality, format, maxWidth, maxHeight]);

  const handleDownload = () => {
    if (!compressed) return;
    const ext = format.split("/")[1];
    const a = document.createElement("a");
    a.href = compressed.url;
    a.download = `compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reduction = original && compressed
    ? Math.round((1 - compressed.blob.size / original.file.size) * 100)
    : 0;

  const formatOptions: { label: string; value: OutputFormat }[] = [
    { label: "JPEG", value: "image/jpeg" },
    { label: "PNG", value: "image/png" },
    { label: "WebP", value: "image/webp" },
  ];

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!original ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-12 transition-colors",
            isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-surface"
          )}
        >
          <svg className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-muted">
            Drop an image here or <span className="text-accent">browse</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Quality slider */}
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
                disabled={format === "image/png"}
              />
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Format</label>
              <div className="flex rounded-md border border-border text-sm">
                {formatOptions.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setFormat(value)}
                    className={cn(
                      "flex-1 px-2 py-1.5 font-medium transition-colors",
                      format === value ? "bg-accent text-white" : "hover:bg-surface"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max width */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Max width (px)</label>
              <input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                placeholder={String(original.width)}
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Max height */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted">Max height (px)</label>
              <input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                placeholder={String(original.height)}
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={compress}
              disabled={isCompressing}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {isCompressing ? "Compressing..." : "Compress"}
            </button>
            {compressed && (
              <button
                onClick={handleDownload}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
              >
                Download
              </button>
            )}
            <button
              onClick={() => {
                setOriginal(null);
                setCompressed(null);
              }}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              Reset
            </button>
          </div>

          {/* Stats bar */}
          {compressed && (
            <div className="rounded-md border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-muted">Original:</span>
                <span className="font-medium text-foreground">{formatBytes(original.file.size)}</span>
                <span className="text-muted">({original.width} x {original.height})</span>
                <span className="text-muted mx-1">&rarr;</span>
                <span className="text-muted">Compressed:</span>
                <span className="font-medium text-foreground">{formatBytes(compressed.blob.size)}</span>
                <span className="text-muted">({compressed.width} x {compressed.height})</span>
                <span className={cn(
                  "ml-1 font-semibold",
                  reduction > 0 ? "text-success" : "text-error"
                )}>
                  ({reduction > 0 ? `${reduction}% reduction` : `${Math.abs(reduction)}% increase`})
                </span>
              </div>
            </div>
          )}

          {/* Before / After previews */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Original</label>
              <div className="overflow-hidden rounded-md border border-border bg-surface">
                <img
                  src={original.url}
                  alt="Original"
                  className="mx-auto max-h-64 object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Compressed</label>
              <div className="flex items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
                {compressed ? (
                  <img
                    src={compressed.url}
                    alt="Compressed"
                    className="mx-auto max-h-64 object-contain"
                  />
                ) : (
                  <p className="p-12 text-sm text-muted">
                    Compressed preview will appear here
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
