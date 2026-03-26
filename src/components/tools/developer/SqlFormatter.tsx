"use client";

import { useState, useMemo, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";
import { format } from "sql-formatter";

type Dialect =
  | "sql"
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "bigquery"
  | "transactsql";
type IndentSize = 2 | 4;
type KeywordCase = "preserve" | "upper" | "lower";

const DIALECTS: { label: string; value: Dialect }[] = [
  { label: "Standard SQL", value: "sql" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "MySQL", value: "mysql" },
  { label: "SQLite", value: "sqlite" },
  { label: "BigQuery", value: "bigquery" },
  { label: "T-SQL", value: "transactsql" },
];

function formatSql(
  sql: string,
  dialect: Dialect,
  indentSize: IndentSize,
  keywordCase: KeywordCase
): string {
  return format(sql, {
    language: dialect,
    tabWidth: indentSize,
    keywordCase: keywordCase,
  });
}

function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1")
    .trim();
}

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");

  const { formatted, error } = useMemo(() => {
    if (!input.trim()) return { formatted: "", error: null };
    try {
      return { formatted: formatSql(input, dialect, indentSize, keywordCase), error: null };
    } catch (err) {
      return {
        formatted: "",
        error: err instanceof Error ? err.message : "Failed to format SQL",
      };
    }
  }, [input, dialect, indentSize, keywordCase]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      setInput(formatSql(input, dialect, indentSize, keywordCase));
    } catch {
      // leave as-is
    }
  }, [input, dialect, indentSize, keywordCase]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setInput(minifySql(input));
  }, [input]);

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

        {/* Dialect selector */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Indent toggle */}
          <div className="flex rounded-md border border-border text-sm">
            <button
              onClick={() => setIndentSize(2)}
              className={cn(
                "px-3 py-1.5 font-medium transition-colors",
                indentSize === 2
                  ? "bg-accent text-white"
                  : "hover:bg-surface"
              )}
            >
              2 sp
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
              4 sp
            </button>
          </div>

          {/* Keyword case */}
          <select
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="preserve">Preserve case</option>
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL here..."
            spellCheck={false}
            className={cn(
              "h-80 w-full resize-y rounded-md border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
              error ? "border-error" : "border-border"
            )}
          />
          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted">
              Formatted Output
            </label>
            {formatted && <CopyButton text={formatted} />}
          </div>
          <textarea
            value={formatted}
            readOnly
            placeholder="Formatted SQL will appear here..."
            spellCheck={false}
            className="h-80 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
