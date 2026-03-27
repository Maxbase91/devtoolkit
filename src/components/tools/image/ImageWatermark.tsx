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

type Position =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

type Rotation = -45 | 0 | 45;

const POSITIONS: { label: string; value: Position }[][] = [
  [
    { label: "TL", value: "top-left" },
    { label: "TC", value: "top-center" },
    { label: "TR", value: "top-right" },
  ],
  [
    { label: "ML", value: "middle-left" },
    { label: "C", value: "center" },
    { label: "MR", value: "middle-right" },
  ],
  [
    { label: "BL", value: "bottom-left" },
    { label: "BC", value: "bottom-center" },
    { label: "BR", value: "bottom-right" },
  ],
];

const ROTATIONS: { label: string; value: Rotation }[] = [
  { label: "-45\u00B0", value: -45 },
  { label: "0\u00B0", value: 0 },
  { label: "45\u00B0", value: 45 },
];

function getPositionCoords(
  position: Position,
  imgWidth: number,
  imgHeight: number,
  textMetrics: TextMetrics,
  fontSize: number,
): { x: number; y: number; textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline } {
  const padding = fontSize;

  const alignMap: Record<string, CanvasTextAlign> = {
    left: "left",
    center: "center",
    right: "right",
  };
  const baselineMap: Record<string, CanvasTextBaseline> = {
    top: "top",
    middle: "middle",
    bottom: "bottom",
  };

  const col = position.includes("left") ? "left" : position.includes("right") ? "right" : "center";
  const row = position.includes("top") ? "top" : position.includes("bottom") ? "bottom" : "middle";

  const x = col === "left" ? padding : col === "right" ? imgWidth - padding : imgWidth / 2;
  const y = row === "top" ? padding : row === "bottom" ? imgHeight - padding : imgHeight / 2;

  return {
    x,
    y,
    textAlign: alignMap[col],
    textBaseline: baselineMap[row],
  };
}

export default function ImageWatermark() {
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [rotation, setRotation] = useState<Rotation>(0);
  const [tiled, setTiled] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgObjRef.current = img;
      setOriginal({ file, url, width: img.width, height: img.height });
      setOutputBlob(null);
    };
    img.src = url;
  }, []);

  /** Render watermark on canvas whenever any control changes. */
  useEffect(() => {
    if (!original || !canvasRef.current || !imgObjRef.current) return;

    const canvas = canvasRef.current;
    const img = imgObjRef.current;
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d")!;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    if (!text.trim()) {
      exportBlob(canvas);
      return;
    }

    // Watermark settings
    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;

    const angleRad = (rotation * Math.PI) / 180;

    if (tiled) {
      // Tile watermark diagonally across the image
      const spacingX = fontSize * 8;
      const spacingY = fontSize * 4;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = -img.height; y < img.height * 2; y += spacingY) {
        for (let x = -img.width; x < img.width * 2; x += spacingX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angleRad);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    } else {
      // Single watermark at position
      const metrics = ctx.measureText(text);
      const coords = getPositionCoords(position, img.width, img.height, metrics, fontSize);

      ctx.save();
      ctx.translate(coords.x, coords.y);
      ctx.rotate(angleRad);
      ctx.textAlign = coords.textAlign;
      ctx.textBaseline = coords.textBaseline;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;

    exportBlob(canvas);
  }, [original, text, fontSize, color, opacity, position, rotation, tiled]);

  function exportBlob(canvas: HTMLCanvasElement) {
    canvas.toBlob((blob) => {
      if (blob) setOutputBlob(blob);
    }, "image/png");
  }

  function handleReset() {
    if (original) URL.revokeObjectURL(original.url);
    setOriginal(null);
    setText("Watermark");
    setFontSize(48);
    setColor("#ffffff");
    setOpacity(50);
    setPosition("bottom-right");
    setRotation(0);
    setTiled(false);
    setOutputBlob(null);
    imgObjRef.current = null;
  }

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
      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Watermark text */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <label className="text-sm font-medium text-muted">Watermark Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter watermark text"
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-muted">Font Size</label>
            <span className="font-mono text-foreground">{fontSize}px</span>
          </div>
          <input
            type="range"
            min={12}
            max={120}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-muted">Opacity</label>
            <span className="font-mono text-foreground">{opacity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-border bg-surface"
            />
            <span className="font-mono text-sm text-foreground">{color}</span>
          </div>
        </div>

        {/* Position grid */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Position</label>
          <div className="inline-grid grid-cols-3 gap-1 rounded-md border border-border p-1">
            {POSITIONS.flat().map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPosition(value)}
                disabled={tiled}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  position === value && !tiled
                    ? "bg-accent text-white"
                    : "hover:bg-surface disabled:opacity-40",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Rotation</label>
          <div className="flex rounded-md border border-border text-sm">
            {ROTATIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setRotation(value)}
                className={cn(
                  "flex-1 px-2 py-1.5 font-medium transition-colors",
                  rotation === value ? "bg-accent text-white" : "hover:bg-surface"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tile toggle */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Tile / Repeat</label>
          <button
            onClick={() => setTiled((v) => !v)}
            className={cn(
              "w-full rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              tiled
                ? "border-accent bg-accent text-white"
                : "border-border hover:bg-surface"
            )}
          >
            {tiled ? "Tiled" : "Single"}
          </button>
        </div>
      </div>

      {/* Live preview canvas */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Preview</label>
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <canvas
            ref={canvasRef}
            className="mx-auto max-h-96 w-full object-contain"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <BlobDownloadButton blob={outputBlob} filename="watermarked.png" />
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
