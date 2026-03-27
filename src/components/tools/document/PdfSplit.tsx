"use client";

import { useState, useCallback, useMemo } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";
import { parsePageRange, formatBytes } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

interface PdfInfo {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export default function PdfSplit() {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setError(null);
    setResultBlob(null);
    setRangeInput("");
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPdfInfo({
        file,
        name: file.name,
        size: file.size,
        pageCount: doc.getPageCount(),
        arrayBuffer: buffer,
      });
    } catch {
      setError(`Failed to load "${file.name}". It may be encrypted or not a valid PDF.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setPdfInfo(null);
    setRangeInput("");
    setResultBlob(null);
    setError(null);
  }, []);

  const selectedPages = useMemo(() => {
    if (!pdfInfo || !rangeInput.trim()) return [];
    return parsePageRange(rangeInput, pdfInfo.pageCount);
  }, [rangeInput, pdfInfo]);

  const applyQuickRange = useCallback(
    (value: string) => {
      setRangeInput(value);
      setResultBlob(null);
    },
    []
  );

  const quickButtons = useMemo(() => {
    if (!pdfInfo) return [];
    const total = pdfInfo.pageCount;

    const oddPages = Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p % 2 === 1)
      .join(", ");
    const evenPages = Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p % 2 === 0)
      .join(", ");

    return [
      { label: "First page", value: "1" },
      { label: "Last page", value: String(total) },
      { label: "All odd", value: oddPages },
      { label: "All even", value: evenPages },
    ];
  }, [pdfInfo]);

  const handleExtract = useCallback(async () => {
    if (!pdfInfo || selectedPages.length === 0) return;

    setError(null);
    setProcessing(true);
    setResultBlob(null);

    try {
      const sourceDoc = await PDFDocument.load(pdfInfo.arrayBuffer, {
        ignoreEncryption: true,
      });
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(sourceDoc, selectedPages);

      for (const page of copiedPages) {
        newDoc.addPage(page);
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      setError(`Extraction failed: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  }, [pdfInfo, selectedPages]);

  const rangeIsInvalid = useMemo(() => {
    if (!rangeInput.trim() || !pdfInfo) return false;
    return selectedPages.length === 0;
  }, [rangeInput, pdfInfo, selectedPages]);

  if (!pdfInfo) {
    return (
      <div className="space-y-4">
        <FileDropZone
          accept=".pdf"
          onFiles={handleFiles}
          label="Drop a PDF file here or click to browse"
          sublabel="Select a PDF to extract pages from"
        />
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-surface p-4 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading PDF...
          </div>
        )}
        {error && (
          <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File info */}
      <div className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{pdfInfo.name}</p>
          <p className="text-xs text-muted">
            {formatBytes(pdfInfo.size)} &middot; {pdfInfo.pageCount} page{pdfInfo.pageCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-background"
          title="Upload a different file"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Page range input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Page Range</label>
        <input
          type="text"
          value={rangeInput}
          onChange={(e) => {
            setRangeInput(e.target.value);
            setResultBlob(null);
          }}
          placeholder={`e.g. 1-3, 5, 8-${pdfInfo.pageCount}`}
          className={cn(
            "w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
            rangeIsInvalid ? "border-error" : "border-border"
          )}
        />
        {rangeInput.trim() && (
          <p className={cn("text-xs", rangeIsInvalid ? "text-error" : "text-muted")}>
            {rangeIsInvalid
              ? "No valid pages in this range"
              : `${selectedPages.length} page${selectedPages.length !== 1 ? "s" : ""} selected`}
          </p>
        )}
      </div>

      {/* Quick buttons */}
      <div className="flex flex-wrap gap-2">
        {quickButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => applyQuickRange(btn.value)}
            disabled={btn.label === "All even" && pdfInfo.pageCount < 2}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface disabled:opacity-30"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleExtract}
          disabled={selectedPages.length === 0 || processing}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-accent text-white hover:bg-accent/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Extracting..." : "Extract Pages"}
        </button>

        {resultBlob && (
          <BlobDownloadButton
            blob={resultBlob}
            filename={`${pdfInfo.name.replace(/\.pdf$/i, "")}-extracted.pdf`}
          />
        )}
      </div>
    </div>
  );
}
