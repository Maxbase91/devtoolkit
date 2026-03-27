"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/pdf-utils";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";

type ResizeMode = "exact" | "percentage" | "max-size";

interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ResizedData {
  blob: Blob;
  url: string;
  width: number;
  height: number;
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

export default function ImageResizer() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [resized, setResized] = useState<ResizedData | null>(null);
  const [mode, setMode] = useState<ResizeMode>("exact");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percentage, setPercentage] = useState(100);
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [isResizing, setIsResizing] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal({ file, url, width: img.width, height: img.height });
      setWidth(String(img.width));
      setHeight(String(img.height));
      setResized(null);
    };
    img.src = url;
  }, []);

  const handleWidthChange = (value: string) => {
    setWidth(value);
    if (lockAspect && original && value) {
      const w = parseInt(value, 10);
      if (!isNaN(w) && w > 0) {
        const ratio = original.height / original.width;
        setHeight(String(Math.round(w * ratio)));
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (lockAspect && original && value) {
      const h = parseInt(value, 10);
      if (!isNaN(h) && h > 0) {
        const ratio = original.width / original.height;
        setWidth(String(Math.round(h * ratio)));
      }
    }
  };

  const computeTargetDimensions = (): { w: number; h: number } | null => {
    if (!original) return null;

    if (mode === "exact") {
      const w = parseInt(width, 10);
      const h = parseInt(height, 10);
      if (!w || !h || w <= 0 || h <= 0) return null;
      return { w, h };
    }

    if (mode === "percentage") {
      const scale = percentage / 100;
      return {
        w: Math.max(1, Math.round(original.width * scale)),
        h: Math.max(1, Math.round(original.height * scale)),
      };
    }

    if (mode === "max-size") {
      const mw = maxWidth ? parseInt(maxWidth, 10) : Infinity;
      const mh = maxHeight ? parseInt(maxHeight, 10) : Infinity;
      if ((!maxWidth && !maxHeight) || mw <= 0 || mh <= 0) return null;

      let targetW = original.width;
      let targetH = original.height;

      if (targetW > mw) {
        const ratio = mw / targetW;
        targetW = mw;
        targetH = Math.round(targetH * ratio);
      }
      if (targetH > mh) {
        const ratio = mh / targetH;
        targetH = mh;
        targetW = Math.round(targetW * ratio);
      }
      return { w: targetW, h: targetH };
    }

    return null;
  };

  const resize = useCallback(async () => {
    if (!original) return;
    const dims = computeTargetDimensions();
    if (!dims) return;

    setIsResizing(true);

    const img = new Image();
    img.src = original.url;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, dims.w, dims.h);

    const mime = getMimeType(original.file);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setResized({ blob, url, width: dims.w, height: dims.h });
        }
        setIsResizing(false);
      },
      mime,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original, mode, width, height, percentage, maxWidth, maxHeight]);

  const reset = () => {
    if (original?.url) URL.revokeObjectURL(original.url);
    if (resized?.url) URL.revokeObjectURL(resized.url);
    setOriginal(null);
    setResized(null);
    setWidth("");
    setHeight("");
    setPercentage(100);
    setMaxWidth("");
    setMaxHeight("");
  };

  const modes: { label: string; value: ResizeMode }[] = [
    { label: "Exact Dimensions", value: "exact" },
    { label: "Percentage", value: "percentage" },
    { label: "Max Size", value: "max-size" },
  ];

  const dims = computeTargetDimensions();
  const canResize = !!dims && dims.w > 0 && dims.h > 0;

  return (
    <div className="space-y-6">
      {!original ? (
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drop an image here or click to browse"
        />
      ) : (
        <>
          {/* Original info */}
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted">Original:</span>
              <span className="font-medium text-foreground">
                {original.width} x {original.height}
              </span>
              <span className="text-muted">|</span>
              <span className="font-medium text-foreground">
                {formatBytes(original.file.size)}
              </span>
              <span className="text-muted">|</span>
              <span className="text-muted">{original.file.name}</span>
            </div>
          </div>

          {/* Mode selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted">Resize Mode</label>
            <div className="flex rounded-md border border-border text-sm">
              {modes.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={cn(
                    "flex-1 px-2 py-1.5 font-medium transition-colors",
                    mode === value
                      ? "bg-accent text-white"
                      : "hover:bg-surface",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode-specific controls */}
          {mode === "exact" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    lockAspect
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:bg-surface",
                  )}
                >
                  {lockAspect ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === "percentage" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium text-muted">Scale</label>
                <span className="font-mono text-foreground">{percentage}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={200}
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>1%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
              {dims && (
                <p className="text-sm text-muted">
                  Result: {dims.w} x {dims.h}
                </p>
              )}
            </div>
          )}

          {mode === "max-size" && (
            <div className="space-y-2">
              <p className="text-xs text-muted">
                Image is scaled down to fit within these bounds. Never scaled up.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">
                    Max Width (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    placeholder={String(original.width)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted">
                    Max Height (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    placeholder={String(original.height)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              {dims && (
                <p className="text-sm text-muted">
                  Result: {dims.w} x {dims.h}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resize}
              disabled={isResizing || !canResize}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {isResizing ? "Resizing..." : "Resize"}
            </button>
            <button
              onClick={reset}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              Reset
            </button>
          </div>

          {/* Resized result stats */}
          {resized && (
            <div className="rounded-md border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-muted">Original:</span>
                <span className="font-medium text-foreground">
                  {formatBytes(original.file.size)}
                </span>
                <span className="text-muted">
                  ({original.width} x {original.height})
                </span>
                <span className="mx-1 text-muted">&rarr;</span>
                <span className="text-muted">Resized:</span>
                <span className="font-medium text-foreground">
                  {formatBytes(resized.blob.size)}
                </span>
                <span className="text-muted">
                  ({resized.width} x {resized.height})
                </span>
              </div>
            </div>
          )}

          {/* Previews */}
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
              <label className="text-sm font-medium text-muted">Resized</label>
              <div className="flex items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
                {resized ? (
                  <img
                    src={resized.url}
                    alt="Resized"
                    className="mx-auto max-h-64 object-contain"
                  />
                ) : (
                  <p className="p-12 text-sm text-muted">
                    Resized preview will appear here
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Download */}
          {resized && (
            <BlobDownloadButton
              blob={resized.blob}
              filename={`resized-${original.file.name.replace(/\.[^.]+$/, "")}.${getExtension(getMimeType(original.file))}`}
            />
          )}
        </>
      )}
    </div>
  );
}
