"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

const AVAILABLE_FLAGS = ["g", "i", "m", "s"] as const;

interface MatchDetail {
  index: number;
  value: string;
  groups: string[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Set<string>>(new Set(["g"]));
  const [testString, setTestString] = useState("");

  const toggleFlag = (flag: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) {
        next.delete(flag);
      } else {
        next.add(flag);
      }
      return next;
    });
  };

  const flagString = useMemo(
    () => AVAILABLE_FLAGS.filter((f) => flags.has(f)).join(""),
    [flags]
  );

  const { regex, regexError } = useMemo(() => {
    if (!pattern) return { regex: null, regexError: null };
    try {
      const re = new RegExp(pattern, flagString);
      return { regex: re, regexError: null };
    } catch (err) {
      return {
        regex: null,
        regexError: err instanceof Error ? err.message : "Invalid regex",
      };
    }
  }, [pattern, flagString]);

  const matches: MatchDetail[] = useMemo(() => {
    if (!regex || !testString) return [];
    const results: MatchDetail[] = [];
    if (flags.has("g")) {
      let match: RegExpExecArray | null;
      const re = new RegExp(regex.source, regex.flags);
      while ((match = re.exec(testString)) !== null) {
        results.push({
          index: match.index,
          value: match[0],
          groups: match.slice(1),
        });
        if (match[0].length === 0) re.lastIndex++;
      }
    } else {
      const match = regex.exec(testString);
      if (match) {
        results.push({
          index: match.index,
          value: match[0],
          groups: match.slice(1),
        });
      }
    }
    return results;
  }, [regex, testString, flags]);

  const highlightedHtml = useMemo(() => {
    if (!regex || !testString || matches.length === 0) {
      return escapeHtml(testString);
    }

    const parts: string[] = [];
    let lastIndex = 0;

    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    for (const match of sortedMatches) {
      if (match.index < lastIndex) continue;
      if (match.index > lastIndex) {
        parts.push(escapeHtml(testString.slice(lastIndex, match.index)));
      }
      parts.push(
        `<mark class="rounded-sm bg-accent/25 text-accent ring-1 ring-accent/40 px-0.5">${escapeHtml(match.value)}</mark>`
      );
      lastIndex = match.index + match.value.length;
    }

    if (lastIndex < testString.length) {
      parts.push(escapeHtml(testString.slice(lastIndex)));
    }

    return parts.join("");
  }, [regex, testString, matches]);

  return (
    <div className="space-y-4">
      {/* Pattern + flags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Pattern</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              spellCheck={false}
              className={cn(
                "w-full rounded-md border bg-surface px-6 py-2 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
                regexError ? "border-error" : "border-border"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted">
              /{flagString}
            </span>
          </div>
        </div>
        {regexError && <p className="text-sm text-error">{regexError}</p>}
      </div>

      {/* Flag toggles */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Flags:</span>
        {AVAILABLE_FLAGS.map((flag) => (
          <button
            key={flag}
            onClick={() => toggleFlag(flag)}
            className={cn(
              "rounded-md border px-3 py-1 font-mono text-sm font-medium transition-colors",
              flags.has(flag)
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:bg-surface"
            )}
          >
            {flag}
          </button>
        ))}
        {matches.length > 0 && (
          <span className="ml-auto text-sm text-success">
            {matches.length} match{matches.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Test string + highlighted output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string..."
            spellCheck={false}
            className="h-48 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">
            Highlighted Matches
          </label>
          <pre
            className="h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground"
            dangerouslySetInnerHTML={{ __html: highlightedHtml || '<span class="text-muted">Matches will be highlighted here...</span>' }}
          />
        </div>
      </div>

      {/* Match details */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Match Details
            </label>
            <CopyButton
              text={matches
                .map(
                  (m, i) =>
                    `Match ${i + 1}: "${m.value}" at index ${m.index}${
                      m.groups.length
                        ? ` | Groups: ${m.groups.map((g) => `"${g}"`).join(", ")}`
                        : ""
                    }`
                )
                .join("\n")}
              label="Copy all"
            />
          </div>
          <div className="max-h-48 space-y-1 overflow-auto rounded-md border border-border bg-surface p-3">
            {matches.map((match, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-sm px-2 py-1 text-sm odd:bg-background"
              >
                <span className="font-mono text-muted">#{idx + 1}</span>
                <span className="font-mono text-accent">
                  &quot;{match.value}&quot;
                </span>
                <span className="text-muted">index {match.index}</span>
                {match.groups.length > 0 && (
                  <span className="text-muted">
                    Groups:{" "}
                    {match.groups.map((g, gi) => (
                      <span key={gi} className="font-mono text-purple-400">
                        {gi > 0 && ", "}
                        &quot;{g}&quot;
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
