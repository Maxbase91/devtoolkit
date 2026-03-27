"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatBytes } from "@/lib/pdf-utils";

interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface IconVariant {
  size: number;
  blob: Blob;
  dataUrl: string;
}

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 512] as const;

function generateHtmlSnippet(): string {
  const lines: string[] = [];
  for (const size of FAVICON_SIZES) {
    if (size === 180) {
      lines.push(`<link rel="apple-touch-icon" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">`);
    } else {
      lines.push(`<link rel="icon" type="image/png" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">`);
    }
  }
  return lines.join("\n");
}

export default function FaviconGenerator() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [icons, setIcons] = useState<IconVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal({ file, url, width: img.width, height: img.height });
      setIcons([]);
      generateIcons(img);
    };
    img.src = url;
  }, []);

  async function generateIcons(img: HTMLImageElement) {
    setIsGenerating(true);

    const results: IconVariant[] = [];

    for (const size of FAVICON_SIZES) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      const dataUrl = canvas.toDataURL("image/png");
      results.push({ size, blob, dataUrl });
    }

    setIcons(results);
    setIsGenerating(false);
  }

  async function handleDownloadZip() {
    if (icons.length === 0) return;
    setIsZipping(true);

    const zip = new JSZip();
    for (const icon of icons) {
      zip.file(`favicon-${icon.size}x${icon.size}.png`, icon.blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicons.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsZipping(false);
  }

  function handleReset() {
    if (original) URL.revokeObjectURL(original.url);
    setOriginal(null);
    setIcons([]);
  }

  const isNotSquare = original && original.width !== original.height;
  const htmlSnippet = generateHtmlSnippet();

  if (!original) {
    return (
      <div className="space-y-6">
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drop an image here or click to browse"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning for non-square images */}
      {isNotSquare && (
        <div className="rounded-md border border-border bg-surface p-3 text-sm text-error">
          Best results with a square image. Your image is {original.width} x {original.height}.
        </div>
      )}

      {/* Original preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">
          Source ({original.width} x {original.height}, {formatBytes(original.file.size)})
        </label>
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <img
            src={original.url}
            alt="Source"
            className="mx-auto max-h-48 object-contain"
          />
        </div>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <p className="text-sm text-muted">Generating favicons...</p>
      )}

      {/* Icon grid */}
      {icons.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted">Generated Sizes</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {icons.map((icon) => (
              <div
                key={icon.size}
                className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface p-4"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: Math.max(icon.size, 32),
                    height: Math.max(icon.size, 32),
                  }}
                >
                  <img
                    src={icon.dataUrl}
                    alt={`${icon.size}x${icon.size}`}
                    width={icon.size}
                    height={icon.size}
                    className="image-rendering-pixelated"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {icon.size} x {icon.size}
                </p>
                <p className="text-xs text-muted">{formatBytes(icon.blob.size)}</p>
                <BlobDownloadButton
                  blob={icon.blob}
                  filename={`favicon-${icon.size}x${icon.size}.png`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {icons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isZipping ? "Zipping..." : "Download All as ZIP"}
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            Reset
          </button>
        </div>
      )}

      {/* HTML snippet */}
      {icons.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">HTML Link Tags</label>
            <CopyButton text={htmlSnippet} />
          </div>
          <pre className="overflow-x-auto rounded-md border border-border bg-surface p-4 text-xs text-foreground">
            {htmlSnippet}
          </pre>
        </div>
      )}
    </div>
  );
}
