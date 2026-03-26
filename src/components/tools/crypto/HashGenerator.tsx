"use client";

import { useState, useCallback, useRef } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

// ---------- Pure JS MD5 implementation ----------

function md5(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);

  function toWord(a: number, b: number, c: number, d: number): number {
    return ((d << 24) | (c << 16) | (b << 8) | a) >>> 0;
  }

  // Pre-processing: add padding
  const bitLen = bytes.length * 8;
  const padLen = bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const padded = new Uint8Array(bytes.length + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Append original length in bits as 64-bit little-endian
  const lenView = new DataView(padded.buffer, padded.length - 8, 8);
  lenView.setUint32(0, bitLen >>> 0, true);
  lenView.setUint32(4, Math.floor(bitLen / 0x100000000) >>> 0, true);

  // Per-round shift amounts
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Pre-computed T table: floor(2^32 * abs(sin(i+1)))
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)) >>> 0;
  }

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      const base = offset + j * 4;
      M[j] = toWord(padded[base], padded[base + 1], padded[base + 2], padded[base + 3]);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      const rotated = ((F << s[i]) | (F >>> (32 - s[i]))) >>> 0;
      B = (B + rotated) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Output in little-endian
  function wordToHex(w: number): string {
    return [w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff, (w >> 24) & 0xff]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return wordToHex(a0) + wordToHex(b0) + wordToHex(c0) + wordToHex(d0);
}

// ---------- Hashing helpers ----------

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashWithSubtle(
  algorithm: string,
  data: ArrayBuffer
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return arrayBufferToHex(hashBuffer);
}

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

async function computeAllHashes(data: ArrayBuffer): Promise<HashResult> {
  const [sha1, sha256, sha512] = await Promise.all([
    hashWithSubtle("SHA-1", data),
    hashWithSubtle("SHA-256", data),
    hashWithSubtle("SHA-512", data),
  ]);

  return {
    md5: md5(data),
    sha1,
    sha256,
    sha512,
  };
}

type InputMode = "text" | "file";

const HASH_LABELS: { key: keyof HashResult; label: string }[] = [
  { key: "md5", label: "MD5" },
  { key: "sha1", label: "SHA-1" },
  { key: "sha256", label: "SHA-256" },
  { key: "sha512", label: "SHA-512" },
];

export default function HashGenerator() {
  const [mode, setMode] = useState<InputMode>("text");
  const [textInput, setTextInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [hashes, setHashes] = useState<HashResult | null>(null);
  const [hashing, setHashing] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hashText = useCallback(async (text: string) => {
    if (!text) {
      setHashes(null);
      return;
    }
    setError(null);
    setHashing(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text).buffer as ArrayBuffer;
      const result = await computeAllHashes(data);
      setHashes(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setHashing(false);
    }
  }, []);

  const handleTextChange = useCallback(
    (value: string) => {
      setTextInput(value);
      hashText(value);
    },
    [hashText]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setError(null);
      setHashing(true);
      setHashes(null);

      try {
        const buffer = await file.arrayBuffer();
        const result = await computeAllHashes(buffer);
        setHashes(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setHashing(false);
      }
    },
    []
  );

  const applyCase = useCallback(
    (value: string) => (uppercase ? value.toUpperCase() : value),
    [uppercase]
  );

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-border text-sm">
          <button
            onClick={() => {
              setMode("text");
              setFileName(null);
              setHashes(null);
              setError(null);
            }}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              mode === "text" ? "bg-accent text-white" : "hover:bg-surface"
            )}
          >
            Text
          </button>
          <button
            onClick={() => {
              setMode("file");
              setTextInput("");
              setHashes(null);
              setError(null);
            }}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              mode === "file" ? "bg-accent text-white" : "hover:bg-surface"
            )}
          >
            File
          </button>
        </div>

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
      </div>

      {/* Input area */}
      {mode === "text" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Input Text</label>
          <textarea
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter text to hash..."
            spellCheck={false}
            className="h-32 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Select File</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border bg-surface p-8 transition-colors hover:border-accent"
          >
            <div className="text-center">
              {fileName ? (
                <p className="text-sm text-foreground">{fileName}</p>
              ) : (
                <p className="text-sm text-muted">
                  Click to select a file
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Hashing state */}
      {hashing && (
        <div className="rounded-md border border-border bg-surface p-4 text-center text-sm text-muted">
          Hashing...
        </div>
      )}

      {/* Hash results */}
      {hashes && !hashing && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Hashes</label>
          <div className="rounded-md border border-border bg-surface divide-y divide-border">
            {HASH_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span className="w-16 shrink-0 text-sm font-medium text-muted">
                  {label}
                </span>
                <span className="min-w-0 flex-1 break-all font-mono text-sm text-foreground select-all">
                  {applyCase(hashes[key])}
                </span>
                <div className="shrink-0">
                  <CopyButton text={applyCase(hashes[key])} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
