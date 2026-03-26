"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type Format = "v4" | "v7" | "ulid";

const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateUuidV4(): string {
  return crypto.randomUUID();
}

function generateUuidV7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Timestamp: 48 bits in bytes 0-5
  bytes[0] = (now / 2 ** 40) & 0xff;
  bytes[1] = (now / 2 ** 32) & 0xff;
  bytes[2] = (now / 2 ** 24) & 0xff;
  bytes[3] = (now / 2 ** 16) & 0xff;
  bytes[4] = (now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7: set bits 0111 in byte 6 high nibble
  bytes[6] = (bytes[6] & 0x0f) | 0x70;

  // Variant 10xx: set bits in byte 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function generateUlid(): string {
  const now = Date.now();
  const timeChars: string[] = [];

  // Encode 48-bit timestamp as 10 Crockford base32 characters
  let t = now;
  for (let i = 9; i >= 0; i--) {
    timeChars[i] = CROCKFORD_BASE32[t & 0x1f];
    t = Math.floor(t / 32);
  }

  // 80 bits of randomness as 16 Crockford base32 characters
  const randBytes = new Uint8Array(10);
  crypto.getRandomValues(randBytes);

  const randChars: string[] = [];
  // Process 10 bytes (80 bits) into 16 base32 chars
  // Each base32 char = 5 bits, 16 chars = 80 bits
  let bitBuffer = 0;
  let bitsInBuffer = 0;
  let charIdx = 0;

  for (let i = 0; i < randBytes.length; i++) {
    bitBuffer = (bitBuffer << 8) | randBytes[i];
    bitsInBuffer += 8;
    while (bitsInBuffer >= 5) {
      bitsInBuffer -= 5;
      randChars[charIdx++] = CROCKFORD_BASE32[(bitBuffer >> bitsInBuffer) & 0x1f];
    }
  }

  return timeChars.join("") + randChars.join("");
}

function generateIds(format: Format, quantity: number): string[] {
  const results: string[] = [];
  const generator =
    format === "v4"
      ? generateUuidV4
      : format === "v7"
        ? generateUuidV7
        : generateUlid;

  for (let i = 0; i < quantity; i++) {
    results.push(generator());
  }
  return results;
}

export default function UuidGenerator() {
  const [format, setFormat] = useState<Format>("v4");
  const [quantity, setQuantity] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleGenerate = useCallback(() => {
    setResults(generateIds(format, quantity));
  }, [format, quantity]);

  const applyCase = useCallback(
    (value: string) => (uppercase ? value.toUpperCase() : value.toLowerCase()),
    [uppercase]
  );

  // ULID is always uppercase by Crockford spec, hex formats get the toggle
  const displayResults = results.map((r) =>
    format === "ulid" ? r : applyCase(r)
  );

  const allText = displayResults.join("\n");

  const formats: { value: Format; label: string; description: string }[] = [
    { value: "v4", label: "UUID v4", description: "Random" },
    { value: "v7", label: "UUID v7", description: "Time-based" },
    { value: "ulid", label: "ULID", description: "Sortable" },
  ];

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Format</label>
        <div className="flex rounded-md border border-border text-sm">
          {formats.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setFormat(value)}
              className={cn(
                "flex-1 px-4 py-1.5 font-medium transition-colors",
                format === value
                  ? "bg-accent text-white"
                  : "hover:bg-surface text-foreground"
              )}
            >
              {label}
              <span className="ml-1 text-xs opacity-70">({description})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Quantity</label>
          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => {
              const val = Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1));
              setQuantity(val);
            }}
            className="w-24 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Case toggle (only for hex formats) */}
        {format !== "ulid" && (
          <button
            onClick={() => setUppercase((prev) => !prev)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              uppercase
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:bg-surface"
            )}
          >
            {uppercase ? "UPPERCASE" : "lowercase"}
          </button>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Generate
        </button>
      </div>

      {/* Results */}
      {displayResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Results ({displayResults.length})
            </label>
            {displayResults.length > 1 && (
              <CopyButton text={allText} label="Copy All" />
            )}
          </div>
          <div className="rounded-md border border-border bg-surface divide-y divide-border">
            {displayResults.map((id, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2"
              >
                <span className="font-mono text-sm text-foreground select-all break-all">
                  {id}
                </span>
                <div className="ml-3 shrink-0">
                  <CopyButton text={id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
