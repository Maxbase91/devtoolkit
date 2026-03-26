"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: number;
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");

  const m = origLines.length;
  const n = modLines.length;

  // LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const stack: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      stack.push({ type: "unchanged", content: origLines[i - 1], lineNumber: 0 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", content: modLines[j - 1], lineNumber: 0 });
      j--;
    } else {
      stack.push({ type: "removed", content: origLines[i - 1], lineNumber: 0 });
      i--;
    }
  }

  stack.reverse();
  return stack.map((line, idx) => ({ ...line, lineNumber: idx + 1 }));
}

export default function TextDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const diff = useMemo(() => computeDiff(original, modified), [original, modified]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    for (const l of diff) {
      if (l.type === "added") added++;
      else if (l.type === "removed") removed++;
      else unchanged++;
    }
    return { added, removed, unchanged };
  }, [diff]);

  const hasInput = original.length > 0 || modified.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Original</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text..."
            rows={10}
            className="w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Modified</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text..."
            rows={10}
            className="w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {hasInput && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-success">+{stats.added} added</span>
          <span className="text-error">-{stats.removed} removed</span>
          <span className="text-muted">{stats.unchanged} unchanged</span>
          <button
            onClick={() => {
              setOriginal("");
              setModified("");
            }}
            className="ml-auto text-sm text-muted hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {hasInput && diff.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border">
          <div className="max-h-96 overflow-y-auto">
            {diff.map((line, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex font-mono text-sm",
                  line.type === "added" && "bg-success/10 text-success",
                  line.type === "removed" && "bg-error/10 text-error",
                  line.type === "unchanged" && "text-muted"
                )}
              >
                <span className="w-8 shrink-0 select-none border-r border-border px-2 py-0.5 text-right text-xs text-muted">
                  {line.lineNumber}
                </span>
                <span className="w-5 shrink-0 select-none px-1 py-0.5 text-center">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap break-all px-2 py-0.5">
                  {line.content || "\u00A0"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
