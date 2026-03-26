"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
  "for", "of", "is", "it", "by", "with", "as", "from", "this", "that",
]);

function generateSlug(
  text: string,
  separator: string,
  lowercase: boolean,
  removeStopWords: boolean
): string {
  let result = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (lowercase) {
    result = result.toLowerCase();
  }

  let words = result.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  if (removeStopWords) {
    words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  }

  return words.join(separator);
}

type Separator = "-" | "_" | ".";

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<Separator>("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);

  const slug = generateSlug(input, separator, lowercase, removeStopWords);
  const separators: Separator[] = ["-", "_", "."];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title or text</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a title to slugify..."
          autoFocus
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Separator</span>
          <div className="flex overflow-hidden rounded-md border border-border">
            {separators.map((s) => (
              <button
                key={s}
                onClick={() => setSeparator(s)}
                className={cn(
                  "px-3 py-1.5 font-mono text-sm transition-colors",
                  separator === s
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="accent-accent"
          />
          Lowercase
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removeStopWords}
            onChange={(e) => setRemoveStopWords(e.target.checked)}
            className="accent-accent"
          />
          Remove stop words
        </label>
      </div>

      {input && (
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-surface p-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Slug
            </label>
            <p className="break-all font-mono text-lg">{slug || "\u2014"}</p>
          </div>

          <div className="rounded-md border border-border bg-surface p-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
              URL preview
            </label>
            <p className="break-all font-mono text-sm text-muted">
              https://example.com/blog/
              <span className="text-accent">{slug}</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{slug.length} characters</span>
            <CopyButton text={slug} />
          </div>
        </div>
      )}
    </div>
  );
}
