"use client";

import { useState, useEffect, useRef } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type ErrorCorrection = "L" | "M" | "Q" | "H";
type QrSize = 128 | 256 | 512;

const SIZE_OPTIONS: { label: string; value: QrSize }[] = [
  { label: "Small (128)", value: 128 },
  { label: "Medium (256)", value: 256 },
  { label: "Large (512)", value: 512 },
];

const EC_OPTIONS: { label: string; value: ErrorCorrection }[] = [
  { label: "L (7%)", value: "L" },
  { label: "M (15%)", value: "M" },
  { label: "Q (25%)", value: "Q" },
  { label: "H (30%)", value: "H" },
];

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState<QrSize>(256);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("M");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [packageAvailable, setPackageAvailable] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setQrDataUrl("");
      return;
    }

    const ecMap: Record<ErrorCorrection, string> = {
      L: "low",
      M: "medium",
      Q: "quartile",
      H: "high",
    };

    import("qrcode")
      .then((QRCode: { toDataURL: (text: string, opts: Record<string, unknown>) => Promise<string> }) => {
        setPackageAvailable(true);
        return QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          errorCorrectionLevel: ecMap[errorCorrection] as "low" | "medium" | "quartile" | "high",
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      })
      .then(setQrDataUrl)
      .catch((err) => {
        if (err.code === "MODULE_NOT_FOUND" || err.message?.includes("Cannot find module")) {
          setPackageAvailable(false);
        }
        setQrDataUrl("");
      });
  }, [text, size, errorCorrection]);

  function handleDownloadPng() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${size}x${size}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDownloadSvg() {
    if (!text.trim() || !packageAvailable) return;

    import("qrcode").then((QRCode: { toString: (text: string, opts: Record<string, unknown>) => Promise<string> }) => {
      QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: errorCorrection.toLowerCase() as "low" | "medium" | "quartile" | "high",
      }).then((svg: string) => {
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode-${size}x${size}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted">Text or URL</label>
          {text && <CopyButton text={text} />}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL to encode..."
          rows={3}
          className="w-full resize-y rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Size</label>
          <div className="flex rounded-md border border-border text-sm">
            {SIZE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSize(value)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  size === value ? "bg-accent text-white" : "hover:bg-surface"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Error correction</label>
          <div className="flex rounded-md border border-border text-sm">
            {EC_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setErrorCorrection(value)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  errorCorrection === value ? "bg-accent text-white" : "hover:bg-surface"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center rounded-md border border-border bg-white"
          style={{ width: size + 32, height: size + 32 }}
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" width={size} height={size} />
          ) : (
            <p className="px-4 text-center text-sm text-muted">
              {packageAvailable === false
                ? "QR code generation requires the qrcode package. Install with: npm install qrcode @types/qrcode"
                : text.trim()
                  ? "Generating QR code..."
                  : "QR code preview will appear here"}
            </p>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Download buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPng}
            disabled={!qrDataUrl}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download PNG
          </button>
          <button
            onClick={handleDownloadSvg}
            disabled={!qrDataUrl}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
}
