"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function encodeHtmlEntities(text: string, encodeNonAscii: boolean): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (NAMED_ENTITIES[char]) {
      result += NAMED_ENTITIES[char];
    } else if (encodeNonAscii && char.charCodeAt(0) > 127) {
      result += `&#${char.codePointAt(0)};`;
    } else {
      result += char;
    }
  }
  return result;
}

function decodeHtmlEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.textContent ?? text;
}

export default function HtmlEntityEncoder() {
  const [plain, setPlain] = useState("");
  const [entities, setEntities] = useState("");
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlainChange = useCallback(
    (value: string) => {
      setPlain(value);
      setError(null);
      if (!value) {
        setEntities("");
        return;
      }
      try {
        setEntities(encodeHtmlEntities(value, encodeNonAscii));
      } catch {
        setError("Failed to encode text");
      }
    },
    [encodeNonAscii]
  );

  const handleEntitiesChange = useCallback((value: string) => {
    setEntities(value);
    setError(null);
    if (!value) {
      setPlain("");
      return;
    }
    try {
      setPlain(decodeHtmlEntities(value));
    } catch {
      setError("Failed to decode HTML entities");
    }
  }, []);

  const handleNonAsciiToggle = useCallback(
    (checked: boolean) => {
      setEncodeNonAscii(checked);
      setError(null);
      if (!plain) return;
      try {
        setEntities(encodeHtmlEntities(plain, checked));
      } catch {
        setError("Failed to re-encode text");
      }
    },
    [plain]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={encodeNonAscii}
            onChange={(e) => handleNonAsciiToggle(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted">
            Encode non-ASCII to numeric entities
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plain text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Plain Text
            </label>
            {plain && <CopyButton text={plain} />}
          </div>
          <textarea
            value={plain}
            onChange={(e) => handlePlainChange(e.target.value)}
            placeholder='Enter text with <html>, "quotes", & symbols...'
            spellCheck={false}
            className="h-64 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* HTML entities */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              HTML Entities
            </label>
            {entities && <CopyButton text={entities} />}
          </div>
          <textarea
            value={entities}
            onChange={(e) => handleEntitiesChange(e.target.value)}
            placeholder="Enter HTML entities like &amp;lt;div&amp;gt;..."
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
