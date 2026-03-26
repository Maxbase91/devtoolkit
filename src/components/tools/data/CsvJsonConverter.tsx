"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

type Mode = "csv-to-json" | "json-to-csv";
type Delimiter = "," | ";" | "\t";

function parseCsvRow(row: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  fields.push(current);
  return fields;
}

function parseCsv(input: string, delimiter: string, hasHeader: boolean): string {
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return "[]";

  const rows = lines.map((line) => parseCsvRow(line, delimiter));

  if (hasHeader) {
    const headers = rows[0];
    const dataRows = rows.slice(1);
    const result = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = row[index]?.trim() ?? "";
      });
      return obj;
    });
    return JSON.stringify(result, null, 2);
  }

  return JSON.stringify(rows, null, 2);
}

function escapeCsvField(field: string, delimiter: string): string {
  const needsQuoting =
    field.includes(delimiter) || field.includes('"') || field.includes("\n");
  if (needsQuoting) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function jsonToCsv(input: string, delimiter: string): string {
  const parsed = JSON.parse(input);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return "";
  }

  if (typeof parsed[0] === "object" && !Array.isArray(parsed[0])) {
    const allKeys = new Set<string>();
    for (const item of parsed) {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    }
    const headers = Array.from(allKeys);

    const headerRow = headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter);
    const dataRows = parsed.map((item) =>
      headers
        .map((key) => escapeCsvField(String(item[key] ?? ""), delimiter))
        .join(delimiter)
    );

    return [headerRow, ...dataRows].join("\n");
  }

  if (Array.isArray(parsed[0])) {
    return parsed
      .map((row: unknown[]) =>
        row.map((cell) => escapeCsvField(String(cell ?? ""), delimiter)).join(delimiter)
      )
      .join("\n");
  }

  return parsed.map((item: unknown) => String(item)).join("\n");
}

const delimiterOptions: { value: Delimiter; label: string }[] = [
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "\t", label: "Tab" },
];

export default function CsvJsonConverter() {
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [hasHeader, setHasHeader] = useState(true);

  const output = useMemo(() => {
    if (!input.trim()) return "";

    try {
      if (mode === "csv-to-json") {
        return parseCsv(input, delimiter, hasHeader);
      }
      return jsonToCsv(input, delimiter);
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : "Invalid input"}`;
    }
  }, [input, mode, delimiter, hasHeader]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Mode toggle */}
        <div className="flex rounded-md border border-border">
          <button
            onClick={() => setMode("csv-to-json")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "csv-to-json"
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground"
            } rounded-l-md`}
          >
            CSV to JSON
          </button>
          <button
            onClick={() => setMode("json-to-csv")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "json-to-csv"
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground"
            } rounded-r-md`}
          >
            JSON to CSV
          </button>
        </div>

        {/* Delimiter */}
        <select
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value as Delimiter)}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          {delimiterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Header toggle (CSV mode only) */}
        {mode === "csv-to-json" && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded-sm accent-accent"
            />
            First row is header
          </label>
        )}
      </div>

      {/* Input / Output */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {mode === "csv-to-json" ? "CSV Input" : "JSON Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "csv-to-json"
                ? 'name,age,city\n"Doe, John",30,NYC'
                : '[{"name": "John", "age": 30}]'
            }
            className="h-64 w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === "csv-to-json" ? "JSON Output" : "CSV Output"}
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
