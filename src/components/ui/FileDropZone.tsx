"use client";

import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function FileDropZone({
  accept,
  multiple = false,
  onFiles,
  label = "Drop files here or click to browse",
  sublabel,
  className,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFiles(multiple ? files : [files[0]]);
      }
    },
    [onFiles, multiple]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        onFiles(files);
      }
      // Reset so the same file can be selected again
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-8 transition-colors",
        isDragging
          ? "border-accent bg-accent/5"
          : "border-border hover:border-accent/50 hover:bg-surface",
        className
      )}
    >
      <Upload
        className={cn(
          "h-8 w-8",
          isDragging ? "text-accent" : "text-muted"
        )}
      />
      <p className="text-sm font-medium text-muted">{label}</p>
      {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
