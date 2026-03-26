"use client";

import { useState, useMemo, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type IndentSize = 2 | 4;

function getLineFromPosition(text: string, position: number): number {
  return text.slice(0, position).split("\n").length;
}

function parseErrorMessage(error: unknown, input: string): string {
  if (!(error instanceof SyntaxError)) return "Unknown error";
  const msg = error.message;
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const line = getLineFromPosition(input, pos);
    return `${msg} (line ${line})`;
  }
  return msg;
}

function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\bnull\b)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span class="text-blue-400">${match}</span>`;
        }
        return `<span class="text-green-400">${match}</span>`;
      }
      if (/true|false/.test(match)) {
        return `<span class="text-purple-400">${match}</span>`;
      }
      if (/null/.test(match)) {
        return `<span class="text-zinc-500">${match}</span>`;
      }
      return `<span class="text-orange-400">${match}</span>`;
    }
  );
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);

  const { formatted, error } = useMemo(() => {
    if (!input.trim()) return { formatted: "", error: null };
    try {
      const parsed = JSON.parse(input);
      return { formatted: JSON.stringify(parsed, null, indentSize), error: null };
    } catch (err) {
      return { formatted: "", error: parseErrorMessage(err, input) };
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch {
      // leave input as-is if invalid
    }
  }, [input]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, indentSize));
    } catch {
      // leave input as-is if invalid
    }
  }, [input, indentSize]);

  const highlightedHtml = useMemo(() => {
    if (!formatted) return "";
    return syntaxHighlight(formatted);
  }, [formatted]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleFormat}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Minify
        </button>
        <button
          onClick={() => setInput("")}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Clear
        </button>

        {/* Indent toggle */}
        <div className="ml-auto flex items-center rounded-md border border-border text-sm">
          <button
            onClick={() => setIndentSize(2)}
            className={cn(
              "px-3 py-1.5 font-medium transition-colors",
              indentSize === 2
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            2 spaces
          </button>
          <button
            onClick={() => setIndentSize(4)}
            className={cn(
              "px-3 py-1.5 font-medium transition-colors",
              indentSize === 4
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            4 spaces
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            spellCheck={false}
            className={cn(
              "h-80 w-full resize-y rounded-md border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
              error ? "border-error" : "border-border"
            )}
          />
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
          {!error && input.trim() && (
            <p className="text-sm text-success">Valid JSON</p>
          )}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">Output</label>
            {formatted && <CopyButton text={formatted} />}
          </div>
          <pre
            className="h-80 overflow-auto rounded-md border border-border bg-surface p-3 font-mono text-sm"
            dangerouslySetInnerHTML={
              highlightedHtml
                ? { __html: highlightedHtml }
                : undefined
            }
          >
            {!highlightedHtml && (
              <span className="text-muted">Formatted output will appear here...</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
