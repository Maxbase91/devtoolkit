"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

interface Conversion {
  label: string;
  convert: (text: string) => string;
}

function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*|[.!?]\s+)(\w)/g, (_, prefix, char) => prefix + char.toUpperCase());
}

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-./]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toCamelCase(text: string): string {
  const words = splitWords(text);
  if (words.length === 0) return "";
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}

function toPascalCase(text: string): string {
  return splitWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function toSnakeCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join("_");
}

function toKebabCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join("-");
}

function toConstantCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toUpperCase())
    .join("_");
}

function toDotCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLowerCase())
    .join(".");
}

const conversions: Conversion[] = [
  { label: "UPPERCASE", convert: (t) => t.toUpperCase() },
  { label: "lowercase", convert: (t) => t.toLowerCase() },
  { label: "Title Case", convert: toTitleCase },
  { label: "Sentence case", convert: toSentenceCase },
  { label: "camelCase", convert: toCamelCase },
  { label: "PascalCase", convert: toPascalCase },
  { label: "snake_case", convert: toSnakeCase },
  { label: "kebab-case", convert: toKebabCase },
  { label: "CONSTANT_CASE", convert: toConstantCase },
  { label: "dot.case", convert: toDotCase },
];

export default function CaseConverter() {
  const [text, setText] = useState("");

  const results = useMemo(
    () => conversions.map((c) => ({ label: c.label, value: text ? c.convert(text) : "" })),
    [text]
  );

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text to convert..."
        autoFocus
        className="h-32 w-full resize-y rounded-md border border-border bg-surface p-4 font-sans text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.map((result) => (
          <div
            key={result.label}
            className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium text-muted">{result.label}</p>
              <p className="break-all font-mono text-sm text-foreground">
                {result.value || <span className="text-muted italic">—</span>}
              </p>
            </div>
            {result.value && <CopyButton text={result.value} />}
          </div>
        ))}
      </div>
    </div>
  );
}
