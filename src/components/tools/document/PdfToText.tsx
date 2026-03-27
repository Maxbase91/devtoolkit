"use client";

import { useState, useCallback } from "react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatBytes } from "@/lib/pdf-utils";

async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

interface ExtractionResult {
  text: string;
  pageCount: number;
  fileName: string;
  fileSize: number;
}

export default function PdfToText() {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await getPdfjs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const textParts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .filter((item: any) => "str" in item)
          .map((item: any) => item.str)
          .join(" ");
        textParts.push(`--- Page ${i} ---\n${text}`);
      }

      setResult({
        text: textParts.join("\n\n"),
        pageCount: pdf.numPages,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process PDF";
      if (message.toLowerCase().includes("password")) {
        setError("This PDF is encrypted or password-protected.");
      } else {
        setError(`Failed to extract text: ${message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  function handleReset() {
    setResult(null);
    setError(null);
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-surface p-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-muted">Extracting text...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-error/30 bg-error/5 p-4">
          <p className="text-sm text-error">{error}</p>
        </div>
        <button
          onClick={handleReset}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Try another file
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <FileDropZone
        accept=".pdf"
        onFiles={handleFiles}
        label="Drop a PDF here or click to browse"
        sublabel="Text will be extracted from all pages"
      />
    );
  }

  const charCount = result.text.length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface px-4 py-3 text-sm">
        <span className="text-muted">
          File:{" "}
          <span className="font-medium text-foreground">{result.fileName}</span>
        </span>
        <span className="text-muted">
          Size:{" "}
          <span className="font-medium text-foreground">
            {formatBytes(result.fileSize)}
          </span>
        </span>
        <span className="text-muted">
          Pages:{" "}
          <span className="font-medium text-foreground">
            {result.pageCount}
          </span>
        </span>
        <span className="text-muted">
          Characters:{" "}
          <span className="font-medium text-foreground">
            {charCount.toLocaleString()}
          </span>
        </span>
      </div>

      {/* Extracted text */}
      <textarea
        readOnly
        value={result.text}
        className="h-96 w-full resize-y rounded-md border border-border bg-surface p-4 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <CopyButton text={result.text} label="Copy text" />
        <button
          onClick={handleReset}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
