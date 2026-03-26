"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github-dark.css";
import { CopyButton } from "@/components/ui/CopyButton";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);

const DEFAULT_MARKDOWN = `# Markdown Preview

A live preview of your **Markdown** content.

## Text Formatting

This is **bold**, this is *italic*, and this is ~~strikethrough~~.

Here is some \`inline code\` within a sentence.

## Code Block

\`\`\`typescript
interface User {
  name: string;
  email: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

\`\`\`python
def fibonacci(n: int) -> list[int]:
    sequence = [0, 1]
    for _ in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]
\`\`\`

## Lists

### Unordered
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered
1. Step one
2. Step two
3. Step three

## Blockquote

> The best way to predict the future is to invent it.
> — Alan Kay

## Links and Images

[Visit GitHub](https://github.com)

## Table

| Feature   | Status | Priority |
|-----------|--------|----------|
| Parsing   | Done   | High     |
| Highlight | Done   | Medium   |
| Export    | Planned | Low      |

## Horizontal Rule

---

That's the end of this preview.
`;

export default function MarkdownPreview() {
  const [input, setInput] = useState(DEFAULT_MARKDOWN);
  const previewRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    if (!input.trim()) return "";
    return marked(input, { async: false }) as string;
  }, [input]);

  useEffect(() => {
    if (!previewRef.current) return;
    const codeBlocks = previewRef.current.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [html]);

  return (
    <div className="space-y-4">
      {/* Panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Editor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Markdown
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your Markdown here..."
            className="h-[600px] w-full resize-y rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Preview
            </label>
            <CopyButton text={html} label="Copy HTML" />
          </div>
          <div
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: html }}
            className="markdown-preview h-[600px] overflow-y-auto rounded-md border border-border bg-background p-4 text-sm text-foreground"
          />
        </div>
      </div>

      {/* Preview styles */}
      <style jsx global>{`
        .markdown-preview h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid var(--color-border);
        }

        .markdown-preview h2 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.625rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid var(--color-border);
        }

        .markdown-preview h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.375rem;
        }

        .markdown-preview p {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }

        .markdown-preview a {
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .markdown-preview a:hover {
          opacity: 0.8;
        }

        .markdown-preview code {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 0.85em;
          background-color: var(--color-surface);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }

        .markdown-preview pre {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0.375rem;
          padding: 0.875rem;
          margin-bottom: 0.75rem;
          overflow-x: auto;
        }

        .markdown-preview pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.8125rem;
          line-height: 1.6;
        }

        .markdown-preview ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .markdown-preview ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .markdown-preview li {
          margin-bottom: 0.25rem;
          line-height: 1.6;
        }

        .markdown-preview li ul,
        .markdown-preview li ol {
          margin-top: 0.25rem;
          margin-bottom: 0;
        }

        .markdown-preview blockquote {
          border-left: 3px solid var(--color-border);
          padding-left: 0.875rem;
          color: var(--color-muted);
          margin-bottom: 0.75rem;
          font-style: italic;
        }

        .markdown-preview table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .markdown-preview th,
        .markdown-preview td {
          border: 1px solid var(--color-border);
          padding: 0.5rem 0.75rem;
          text-align: left;
        }

        .markdown-preview th {
          font-weight: 600;
          background-color: var(--color-surface);
        }

        .markdown-preview hr {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 1.25rem 0;
        }

        .markdown-preview img {
          max-width: 100%;
          border-radius: 0.375rem;
        }

        .markdown-preview del {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .markdown-preview strong {
          font-weight: 600;
        }

        .markdown-preview em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
