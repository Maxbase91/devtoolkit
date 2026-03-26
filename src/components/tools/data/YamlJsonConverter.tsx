"use client";

import { useState, useMemo } from "react";
import * as yaml from "js-yaml";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type Mode = "yaml-to-json" | "json-to-yaml";

export default function YamlJsonConverter() {
  const [mode, setMode] = useState<Mode>("yaml-to-json");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { output: "", error: "" };

    try {
      if (mode === "yaml-to-json") {
        const parsed = yaml.load(trimmed);
        return { output: JSON.stringify(parsed, null, 2), error: "" };
      }
      const parsed = JSON.parse(trimmed);
      return { output: yaml.dump(parsed), error: "" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid input";
      return { output: "", error: message };
    }
  }, [input, mode]);

  function handleClear() {
    setInput("");
  }

  const inputLabel = mode === "yaml-to-json" ? "YAML" : "JSON";
  const outputLabel = mode === "yaml-to-json" ? "JSON" : "YAML";

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-border">
          <button
            onClick={() => setMode("yaml-to-json")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors rounded-l-md",
              mode === "yaml-to-json"
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground"
            )}
          >
            YAML to JSON
          </button>
          <button
            onClick={() => setMode("json-to-yaml")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors rounded-r-md",
              mode === "json-to-yaml"
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground"
            )}
          >
            JSON to YAML
          </button>
        </div>

        <button
          onClick={handleClear}
          disabled={!input}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {/* Input / Output panels */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {inputLabel} Input
            </label>
            <CopyButton text={input} />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "yaml-to-json"
                ? "name: John Doe\nage: 30\nhobbies:\n  - reading\n  - coding"
                : '{\n  "name": "John Doe",\n  "age": 30,\n  "hobbies": ["reading", "coding"]\n}'
            }
            className="h-64 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {outputLabel} Output
            </label>
            <CopyButton text={output} />
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="h-64 w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground placeholder:text-muted"
          />
        </div>
      </div>
    </div>
  );
}
