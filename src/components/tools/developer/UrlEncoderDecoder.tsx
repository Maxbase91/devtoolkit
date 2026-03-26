"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type EncodingMode = "component" | "full";

export default function UrlEncoderDecoder() {
  const [decoded, setDecoded] = useState("");
  const [encoded, setEncoded] = useState("");
  const [mode, setMode] = useState<EncodingMode>("component");
  const [error, setError] = useState<string | null>(null);

  const encode = useCallback(
    (text: string): string => {
      return mode === "component"
        ? encodeURIComponent(text)
        : encodeURI(text);
    },
    [mode]
  );

  const decode = useCallback(
    (text: string): string => {
      return mode === "component"
        ? decodeURIComponent(text)
        : decodeURI(text);
    },
    [mode]
  );

  const handleDecodedChange = useCallback(
    (value: string) => {
      setDecoded(value);
      setError(null);
      if (!value) {
        setEncoded("");
        return;
      }
      try {
        setEncoded(encode(value));
      } catch {
        setError("Failed to encode text");
      }
    },
    [encode]
  );

  const handleEncodedChange = useCallback(
    (value: string) => {
      setEncoded(value);
      setError(null);
      if (!value) {
        setDecoded("");
        return;
      }
      try {
        setDecoded(decode(value));
      } catch {
        setError("Malformed encoded string — could not decode");
      }
    },
    [decode]
  );

  const handleModeChange = useCallback(
    (newMode: EncodingMode) => {
      setMode(newMode);
      setError(null);
      if (!decoded) return;
      try {
        const encodeFn =
          newMode === "component" ? encodeURIComponent : encodeURI;
        setEncoded(encodeFn(decoded));
      } catch {
        setError("Failed to re-encode with new mode");
      }
    },
    [decoded]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-border text-sm">
          <button
            onClick={() => handleModeChange("component")}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              mode === "component"
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            Component
          </button>
          <button
            onClick={() => handleModeChange("full")}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              mode === "full" ? "bg-accent text-white" : "hover:bg-surface"
            )}
          >
            Full URL
          </button>
        </div>
        <span className="text-xs text-muted">
          {mode === "component"
            ? "encodeURIComponent — encodes all special characters"
            : "encodeURI — preserves URL structure characters (://?#&=)"}
        </span>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Decoded (plain) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Decoded (Plain)
            </label>
            {decoded && <CopyButton text={decoded} />}
          </div>
          <textarea
            value={decoded}
            onChange={(e) => handleDecodedChange(e.target.value)}
            placeholder="Enter plain text or URL..."
            spellCheck={false}
            className="h-64 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Encoded */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">Encoded</label>
            {encoded && <CopyButton text={encoded} />}
          </div>
          <textarea
            value={encoded}
            onChange={(e) => handleEncodedChange(e.target.value)}
            placeholder="Enter encoded text..."
            spellCheck={false}
            className={cn(
              "h-64 w-full resize-y rounded-md border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
              error ? "border-error" : "border-border"
            )}
          />
        </div>
      </div>
    </div>
  );
}
