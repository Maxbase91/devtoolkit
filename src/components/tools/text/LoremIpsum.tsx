"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

const PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
  "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra auctor nunc.",
  "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.",
  "Morbi nec metus. Phasellus blandit leo ut odio. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem. Sed magna purus, fermentum eu, tincidunt eu, varius ut, felis. In auctor lobortis lacus.",
  "Quisque libero metus, condimentum at, tempus commodo, auctor vulputate, erat. Donec viverra mi quis quam. Phasellus a est. Phasellus magna. In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique.",
  "Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est. Quisque id mi. Ut tincidunt tincidunt erat. Etiam vestibulum volutpat enim. Diam nonummy nibh euismod tincidunt ut laoreet.",
];

type Unit = "paragraphs" | "sentences" | "words";

export default function LoremIpsum() {
  const [amount, setAmount] = useState(3);
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const allSentences = useMemo(
    () =>
      PARAGRAPHS.flatMap((p) =>
        p.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0)
      ),
    []
  );

  const allWords = useMemo(() => PARAGRAPHS.join(" ").split(/\s+/), []);

  const output = useMemo(() => {
    const clamped = Math.max(1, Math.min(amount, 50));

    if (unit === "paragraphs") {
      const result: string[] = [];
      for (let i = 0; i < clamped; i++) {
        result.push(PARAGRAPHS[i % PARAGRAPHS.length]);
      }
      if (startWithLorem && result.length > 0 && !result[0].startsWith("Lorem")) {
        result[0] = PARAGRAPHS[0];
      }
      return result.join("\n\n");
    }

    if (unit === "sentences") {
      const result: string[] = [];
      for (let i = 0; i < clamped; i++) {
        result.push(allSentences[i % allSentences.length]);
      }
      if (startWithLorem && result.length > 0 && !result[0].startsWith("Lorem")) {
        result[0] = allSentences[0];
      }
      return result.join(" ");
    }

    const result: string[] = [];
    for (let i = 0; i < clamped; i++) {
      result.push(allWords[i % allWords.length]);
    }
    if (startWithLorem && result.length > 0) {
      result[0] = "Lorem";
    }
    return result.join(" ");
  }, [amount, unit, startWithLorem, allSentences, allWords]);

  const units: Unit[] = ["paragraphs", "sentences", "words"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            min={1}
            max={50}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
            className="w-20 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex overflow-hidden rounded-md border border-border">
          {units.map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={cn(
                "px-3 py-1.5 text-sm capitalize transition-colors",
                unit === u
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              )}
            >
              {u}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="accent-accent"
          />
          Start with &ldquo;Lorem ipsum...&rdquo;
        </label>
      </div>

      <textarea
        readOnly
        value={output}
        rows={12}
        className="w-full resize-y rounded-md border border-border bg-surface p-4 font-mono text-sm leading-relaxed outline-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {output.split(/\s+/).filter(Boolean).length} words
        </span>
        <CopyButton text={output} />
      </div>
    </div>
  );
}
