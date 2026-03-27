"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlobDownloadButtonProps {
  blob: Blob | null;
  filename: string;
  label?: string;
  className?: string;
}

export function BlobDownloadButton({
  blob,
  filename,
  label = "Download",
  className,
}: BlobDownloadButtonProps) {
  function handleDownload() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={!blob}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors",
        "hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
