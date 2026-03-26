"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  return atob(base64);
}

function toHex(str: string): string {
  return Array.from(str)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

function tryParseJson(str: string): object | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

interface DecodedJwt {
  header: object;
  payload: object;
  signatureHex: string;
  rawParts: [string, string, string];
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: expected 3 parts separated by dots");
  }

  const headerStr = base64UrlDecode(parts[0]);
  const payloadStr = base64UrlDecode(parts[1]);
  const signatureRaw = base64UrlDecode(parts[2]);

  const header = tryParseJson(headerStr);
  if (!header) throw new Error("Invalid JWT: header is not valid JSON");

  const payload = tryParseJson(payloadStr);
  if (!payload) throw new Error("Invalid JWT: payload is not valid JSON");

  return {
    header,
    payload,
    signatureHex: toHex(signatureRaw),
    rawParts: [headerStr, payloadStr, signatureRaw],
  };
}

function formatTimestamp(epoch: number): string {
  return new Date(epoch * 1000).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "long",
  });
}

function isExpired(exp: number): boolean {
  return Date.now() > exp * 1000;
}

interface JsonHighlightProps {
  data: object;
}

function JsonHighlight({ data }: JsonHighlightProps) {
  const json = JSON.stringify(data, null, 2);
  const lines = json.split("\n");

  return (
    <pre className="overflow-x-auto text-sm leading-relaxed">
      {lines.map((line, i) => (
        <div key={i}>{highlightLine(line)}</div>
      ))}
    </pre>
  );
}

function highlightLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Match key-value patterns in JSON lines
  const keyMatch = remaining.match(/^(\s*)"([^"]+)"(\s*:\s*)/);
  if (keyMatch) {
    parts.push(<span key={key++}>{keyMatch[1]}</span>);
    parts.push(
      <span key={key++} className="text-accent">
        &quot;{keyMatch[2]}&quot;
      </span>
    );
    parts.push(<span key={key++}>{keyMatch[3]}</span>);
    remaining = remaining.slice(keyMatch[0].length);
  }

  // Highlight the value portion
  if (remaining) {
    parts.push(highlightValue(remaining, key));
  }

  return <>{parts}</>;
}

function highlightValue(value: string, startKey: number): React.ReactNode {
  const trimmed = value.trim().replace(/,\s*$/, "");
  const trailing = value.endsWith(",") ? "," : "";

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return (
      <span key={startKey}>
        <span className="text-success">{trimmed}</span>
        {trailing}
      </span>
    );
  }
  if (trimmed === "true" || trimmed === "false" || trimmed === "null") {
    return (
      <span key={startKey}>
        <span className="text-warning">{trimmed}</span>
        {trailing}
      </span>
    );
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return (
      <span key={startKey}>
        <span className="text-error">{trimmed}</span>
        {trailing}
      </span>
    );
  }
  return <span key={startKey}>{value}</span>;
}

interface ClaimRowProps {
  label: string;
  value: string;
  badge?: { text: string; variant: "success" | "error" };
}

function ClaimRow({ label, value, badge }: ClaimRowProps) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="font-medium text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-foreground">{value}</span>
        {badge && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-medium",
              badge.variant === "success"
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}

export default function JwtDecoder() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { decoded: decodeJwt(input), error: null };
    } catch (err) {
      return { decoded: null, error: (err as Error).message };
    }
  }, [input]);

  const payload = result?.decoded?.payload as Record<string, unknown> | undefined;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Paste JWT</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0..."
          spellCheck={false}
          className="h-28 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Error */}
      {result?.error && (
        <div className="rounded-md border border-error/50 bg-error/5 p-3 text-sm text-error">
          {result.error}
        </div>
      )}

      {/* Decoded sections */}
      {result?.decoded && (
        <div className="space-y-4">
          {/* Header */}
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-accent">Header</h3>
              <CopyButton
                text={JSON.stringify(result.decoded.header, null, 2)}
              />
            </div>
            <div className="font-mono">
              <JsonHighlight data={result.decoded.header} />
            </div>
          </div>

          {/* Payload */}
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-accent">Payload</h3>
              <CopyButton
                text={JSON.stringify(result.decoded.payload, null, 2)}
              />
            </div>
            <div className="font-mono">
              <JsonHighlight data={result.decoded.payload} />
            </div>
          </div>

          {/* Claims */}
          {payload && (
            <div className="rounded-md border border-border bg-surface p-4">
              <h3 className="mb-2 text-sm font-medium text-accent">Claims</h3>
              <div className="divide-y divide-border">
                {typeof payload.sub === "string" && (
                  <ClaimRow label="Subject (sub)" value={payload.sub} />
                )}
                {typeof payload.iss === "string" && (
                  <ClaimRow label="Issuer (iss)" value={payload.iss} />
                )}
                {typeof payload.iat === "number" && (
                  <ClaimRow
                    label="Issued At (iat)"
                    value={formatTimestamp(payload.iat)}
                  />
                )}
                {typeof payload.exp === "number" && (
                  <ClaimRow
                    label="Expires (exp)"
                    value={formatTimestamp(payload.exp)}
                    badge={
                      isExpired(payload.exp)
                        ? { text: "Expired", variant: "error" }
                        : { text: "Valid", variant: "success" }
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-accent">Signature</h3>
              <CopyButton text={result.decoded.signatureHex} />
            </div>
            <p className="break-all font-mono text-sm text-foreground">
              {result.decoded.signatureHex}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
