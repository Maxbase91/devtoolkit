"use client";

import { useState, useCallback, useRef } from "react";
import { X, ChevronUp, ChevronDown, Plus, Loader2 } from "lucide-react";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { BlobDownloadButton } from "@/components/ui/BlobDownloadButton";
import { formatBytes } from "@/lib/pdf-utils";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";

interface PdfFileEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

async function loadPdfEntry(file: File): Promise<PdfFileEntry> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    size: file.size,
    pageCount: doc.getPageCount(),
  };
}

export default function PdfMerge() {
  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    setError(null);
    setResultBlob(null);
    setLoading(true);

    try {
      const entries = await Promise.all(
        newFiles.map(async (file) => {
          try {
            return await loadPdfEntry(file);
          } catch {
            throw new Error(`Failed to load "${file.name}". It may be encrypted or not a valid PDF.`);
          }
        })
      );
      setFiles((prev) => [...prev, ...entries]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultBlob(null);
  }, []);

  const moveFile = useCallback((index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setResultBlob(null);
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return;
    setError(null);
    setProcessing(true);
    setResultBlob(null);

    try {
      const mergedDoc = await PDFDocument.create();

      for (const entry of files) {
        const buffer = await entry.file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const copiedPages = await mergedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());
        for (const page of copiedPages) {
          mergedDoc.addPage(page);
        }
      }

      const pdfBytes = await mergedDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      setError(`Merge failed: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  }, [files]);

  const handleAddMore = useCallback(() => {
    addInputRef.current?.click();
  }, []);

  const handleAddInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(e.target.files ?? []);
      if (newFiles.length > 0) {
        await handleFiles(newFiles);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

  if (files.length === 0) {
    return (
      <div className="space-y-4">
        <FileDropZone
          accept=".pdf"
          multiple
          onFiles={handleFiles}
          label="Drop PDF files here or click to browse"
          sublabel="Select multiple PDFs to merge"
        />
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-surface p-4 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading PDFs...
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
      {/* File list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted">
            {files.length} file{files.length !== 1 ? "s" : ""} &middot; {totalPages} page{totalPages !== 1 ? "s" : ""} total
          </label>
          <button
            onClick={handleAddMore}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-surface"
          >
            <Plus className="h-3.5 w-3.5" />
            Add more
          </button>
          <input
            ref={addInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleAddInputChange}
            className="hidden"
          />
        </div>

        <div className="rounded-md border border-border bg-surface divide-y divide-border">
          {files.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <span className="w-6 shrink-0 text-center text-xs font-medium text-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {entry.name}
                </p>
                <p className="text-xs text-muted">
                  {formatBytes(entry.size)} &middot; {entry.pageCount} page{entry.pageCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => moveFile(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-muted transition-colors hover:bg-background disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveFile(index, 1)}
                  disabled={index === files.length - 1}
                  className="rounded p-1 text-muted transition-colors hover:bg-background disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeFile(entry.id)}
                  className="rounded p-1 text-muted transition-colors hover:text-error hover:bg-error/5"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-surface p-4 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading PDFs...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleMerge}
          disabled={files.length < 2 || processing}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-accent text-white hover:bg-accent/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {processing && <Loader2 className="h-4 w-4 animate-spin" />}
          {processing ? "Merging..." : "Merge PDFs"}
        </button>

        {resultBlob && (
          <BlobDownloadButton blob={resultBlob} filename="merged.pdf" />
        )}
      </div>
    </div>
  );
}
