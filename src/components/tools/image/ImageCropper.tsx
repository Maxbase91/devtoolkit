"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";

interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "3:2";

const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: "Free", value: "free" },
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "3:2", value: "3:2" },
];

function getRatioMultiplier(ratio: AspectRatio): number | null {
  switch (ratio) {
    case "1:1": return 1;
    case "4:3": return 3 / 4;
    case "16:9": return 9 / 16;
    case "3:2": return 2 / 3;
    default: return null;
  }
}

export default function ImageCropper() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedDimensions, setCroppedDimensions] = useState<{ w: number; h: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const data: ImageData = { file, url, width: img.width, height: img.height };
      setOriginal(data);
      setCrop({ x: 0, y: 0, width: img.width, height: img.height });
      setCroppedBlob(null);
      setCroppedUrl(null);
      setCroppedDimensions(null);
      setAspectRatio("free");
    };
    img.src = url;
  }, []);

  /** Returns scale factor: how the image is rendered vs original size. */
  function getDisplayScale(): { scaleX: number; scaleY: number; offsetX: number; offsetY: number } {
    if (!imgRef.current || !containerRef.current || !original) {
      return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const scaleX = imgRect.width / original.width;
    const scaleY = imgRect.height / original.height;
    const offsetX = imgRect.left - containerRect.left;
    const offsetY = imgRect.top - containerRect.top;

    return { scaleX, scaleY, offsetX, offsetY };
  }

  function handleCropChange(field: keyof CropArea, value: number) {
    if (!original) return;
    const next = { ...crop };

    if (field === "width") {
      next.width = Math.max(1, Math.min(value, original.width - next.x));
      const ratio = getRatioMultiplier(aspectRatio);
      if (ratio !== null) {
        next.height = Math.max(1, Math.min(Math.round(next.width * ratio), original.height - next.y));
      }
    } else if (field === "height") {
      next.height = Math.max(1, Math.min(value, original.height - next.y));
    } else if (field === "x") {
      next.x = Math.max(0, Math.min(value, original.width - next.width));
    } else if (field === "y") {
      next.y = Math.max(0, Math.min(value, original.height - next.height));
    }

    setCrop(next);
  }

  function handleAspectChange(ratio: AspectRatio) {
    setAspectRatio(ratio);
    if (!original) return;

    const multiplier = getRatioMultiplier(ratio);
    if (multiplier !== null) {
      const newHeight = Math.max(1, Math.min(Math.round(crop.width * multiplier), original.height - crop.y));
      setCrop((prev) => ({ ...prev, height: newHeight }));
    }
  }

  function handleCrop() {
    if (!original) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

      canvas.toBlob((blob) => {
        if (blob) {
          setCroppedBlob(blob);
          setCroppedUrl(URL.createObjectURL(blob));
          setCroppedDimensions({ w: crop.width, h: crop.height });
        }
      }, "image/png");
    };
    img.src = original.url;
  }

  function handleReset() {
    if (original) URL.revokeObjectURL(original.url);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setOriginal(null);
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setCroppedBlob(null);
    setCroppedUrl(null);
    setCroppedDimensions(null);
    setAspectRatio("free");
  }

  // Recompute overlay whenever crop/original changes
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!original) return;
    const { scaleX, scaleY, offsetX, offsetY } = getDisplayScale();
    setOverlayStyle({
      position: "absolute",
      left: offsetX + crop.x * scaleX,
      top: offsetY + crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
      border: "2px dashed rgba(59, 130, 246, 0.8)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      pointerEvents: "none",
    });
  });

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

  const isValidCrop = crop.width > 0 && crop.height > 0;

  return (
    <div className="space-y-6">
      {/* Image preview with crop overlay */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Preview</label>
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-md border border-border bg-surface"
          style={{ height: 400 }}
        >
          <img
            ref={imgRef}
            src={original.url}
            alt="Original"
            className="h-full w-full object-contain"
          />
          {isValidCrop && <div style={overlayStyle} />}
        </div>
        <p className="text-xs text-muted">
          Original: {original.width} x {original.height}
        </p>
      </div>

      {/* Aspect ratio presets */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted">Aspect Ratio</label>
        <div className="flex rounded-md border border-border text-sm">
          {ASPECT_RATIOS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleAspectChange(value)}
              className={cn(
                "flex-1 px-2 py-1.5 font-medium transition-colors",
                aspectRatio === value ? "bg-accent text-white" : "hover:bg-surface"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Crop inputs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(["x", "y", "width", "height"] as const).map((field) => (
          <div key={field} className="space-y-1.5">
            <label className="text-sm font-medium text-muted">
              {field === "x" ? "X" : field === "y" ? "Y" : field === "width" ? "Width" : "Height"} (px)
            </label>
            <input
              type="number"
              min={0}
              max={
                field === "x" ? original.width - 1
                  : field === "y" ? original.height - 1
                  : field === "width" ? original.width - crop.x
                  : original.height - crop.y
              }
              value={crop[field]}
              onChange={(e) => handleCropChange(field, parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCrop}
          disabled={!isValidCrop}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          Crop
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Reset
        </button>
      </div>

      {/* Cropped result */}
      {croppedUrl && croppedDimensions && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted">
            Cropped Result ({croppedDimensions.w} x {croppedDimensions.h})
          </label>
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <img
              src={croppedUrl}
              alt="Cropped"
              className="mx-auto max-h-64 object-contain"
            />
          </div>
          <BlobDownloadButton blob={croppedBlob} filename="cropped.png" />
        </div>
      )}
    </div>
  );
}
