"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

function utf8Encode(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function utf8Decode(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

export default function Base64Tool() {
  const [plainText, setPlainText] = useState("");
  const [base64Text, setBase64Text] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [error, setError] = useState<string | null>(null);

  const handlePlainTextChange = useCallback(
    (value: string) => {
      setPlainText(value);
      setError(null);
      if (!value) {
        setBase64Text("");
        return;
      }
      try {
        setBase64Text(utf8Encode(value));
      } catch {
        setError("Failed to encode text");
      }
    },
    []
  );

  const handleBase64Change = useCallback(
    (value: string) => {
      setBase64Text(value);
      setError(null);
      if (!value) {
        setPlainText("");
        return;
      }
      try {
        setPlainText(utf8Decode(value));
      } catch {
        setError("Invalid Base64 string");
      }
    },
    []
  );

  const handleModeToggle = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      setError(null);
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-border text-sm">
          <button
            onClick={() => handleModeToggle("encode")}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              mode === "encode"
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            Encode
          </button>
          <button
            onClick={() => handleModeToggle("decode")}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              mode === "decode"
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            Decode
          </button>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plain text panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Plain Text
              {mode === "encode" && (
                <span className="ml-2 text-xs text-accent">(input)</span>
              )}
            </label>
            {plainText && <CopyButton text={plainText} />}
          </div>
          <textarea
            value={plainText}
            onChange={(e) =>
              mode === "encode"
                ? handlePlainTextChange(e.target.value)
                : handlePlainTextChange(e.target.value)
            }
            placeholder="Enter plain text..."
            spellCheck={false}
            className="h-64 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Base64 panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Base64
              {mode === "decode" && (
                <span className="ml-2 text-xs text-accent">(input)</span>
              )}
            </label>
            {base64Text && <CopyButton text={base64Text} />}
          </div>
          <textarea
            value={base64Text}
            onChange={(e) =>
              mode === "decode"
                ? handleBase64Change(e.target.value)
                : handleBase64Change(e.target.value)
            }
            placeholder="Enter Base64 string..."
            spellCheck={false}
            className={cn(
              "h-64 w-full resize-y rounded-md border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
              error && mode === "decode" ? "border-error" : "border-border"
            )}
          />
        </div>
      </div>
    </div>
  );
}
