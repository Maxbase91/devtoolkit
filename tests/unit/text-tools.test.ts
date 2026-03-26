import { describe, it, expect } from "vitest";

// ─── Case Converter Logic ───────────────────────────────────────────────────

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-./]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
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
    .replace(
      /(^\s*|[.!?]\s+)(\w)/g,
      (_, prefix, char) => prefix + char.toUpperCase()
    );
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

// ─── Slug Generator Logic ───────────────────────────────────────────────────

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
  let result = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (lowercase) {
    result = result.toLowerCase();
  }

  let words = result.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  if (removeStopWords) {
    words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  }

  return words.join(separator);
}

// ─── Text Diff Logic ────────────────────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe("Case Converter", () => {
  describe("uppercase", () => {
    it("converts text to uppercase", () => {
      expect("hello world".toUpperCase()).toBe("HELLO WORLD");
    });

    it("handles empty string", () => {
      expect("".toUpperCase()).toBe("");
    });

    it("handles single word", () => {
      expect("hello".toUpperCase()).toBe("HELLO");
    });

    it("handles special characters", () => {
      expect("hello, world!".toUpperCase()).toBe("HELLO, WORLD!");
    });
  });

  describe("lowercase", () => {
    it("converts text to lowercase", () => {
      expect("HELLO WORLD".toLowerCase()).toBe("hello world");
    });

    it("handles empty string", () => {
      expect("".toLowerCase()).toBe("");
    });

    it("handles single word", () => {
      expect("HELLO".toLowerCase()).toBe("hello");
    });

    it("handles special characters", () => {
      expect("HELLO, WORLD!".toLowerCase()).toBe("hello, world!");
    });
  });

  describe("title case", () => {
    it("converts text to title case", () => {
      expect(toTitleCase("hello world")).toBe("Hello World");
    });

    it("handles empty string", () => {
      expect(toTitleCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toTitleCase("hello")).toBe("Hello");
    });

    it("handles multiple words", () => {
      expect(toTitleCase("the quick brown fox")).toBe("The Quick Brown Fox");
    });

    it("handles special characters", () => {
      // The regex \w\S* treats "hello-world" as one token since `-` is non-whitespace
      expect(toTitleCase("hello-world")).toBe("Hello-world");
    });
  });

  describe("sentence case", () => {
    it("converts text to sentence case", () => {
      expect(toSentenceCase("hello world")).toBe("Hello world");
    });

    it("handles empty string", () => {
      expect(toSentenceCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toSentenceCase("HELLO")).toBe("Hello");
    });

    it("handles multiple sentences", () => {
      expect(toSentenceCase("HELLO WORLD. GOODBYE WORLD")).toBe(
        "Hello world. Goodbye world"
      );
    });

    it("handles special characters", () => {
      expect(toSentenceCase("HELLO! HOW ARE YOU?")).toBe(
        "Hello! How are you?"
      );
    });
  });

  describe("camelCase", () => {
    it("converts text to camelCase", () => {
      expect(toCamelCase("hello world")).toBe("helloWorld");
    });

    it("handles empty string", () => {
      expect(toCamelCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toCamelCase("hello")).toBe("hello");
    });

    it("handles multiple words", () => {
      expect(toCamelCase("the quick brown fox")).toBe("theQuickBrownFox");
    });

    it("handles snake_case input", () => {
      expect(toCamelCase("hello_world")).toBe("helloWorld");
    });

    it("handles kebab-case input", () => {
      expect(toCamelCase("hello-world")).toBe("helloWorld");
    });

    it("handles special characters", () => {
      expect(toCamelCase("hello world!")).toBe("helloWorld!");
    });
  });

  describe("PascalCase", () => {
    it("converts text to PascalCase", () => {
      expect(toPascalCase("hello world")).toBe("HelloWorld");
    });

    it("handles empty string", () => {
      expect(toPascalCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toPascalCase("hello")).toBe("Hello");
    });

    it("handles multiple words", () => {
      expect(toPascalCase("the quick brown fox")).toBe("TheQuickBrownFox");
    });

    it("handles snake_case input", () => {
      expect(toPascalCase("hello_world")).toBe("HelloWorld");
    });
  });

  describe("snake_case", () => {
    it("converts text to snake_case", () => {
      expect(toSnakeCase("hello world")).toBe("hello_world");
    });

    it("handles empty string", () => {
      expect(toSnakeCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toSnakeCase("hello")).toBe("hello");
    });

    it("handles multiple words", () => {
      expect(toSnakeCase("the quick brown fox")).toBe("the_quick_brown_fox");
    });

    it("handles camelCase input", () => {
      expect(toSnakeCase("helloWorld")).toBe("hello_world");
    });

    it("handles special characters", () => {
      expect(toSnakeCase("hello-world")).toBe("hello_world");
    });
  });

  describe("kebab-case", () => {
    it("converts text to kebab-case", () => {
      expect(toKebabCase("hello world")).toBe("hello-world");
    });

    it("handles empty string", () => {
      expect(toKebabCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toKebabCase("hello")).toBe("hello");
    });

    it("handles multiple words", () => {
      expect(toKebabCase("the quick brown fox")).toBe("the-quick-brown-fox");
    });

    it("handles camelCase input", () => {
      expect(toKebabCase("helloWorld")).toBe("hello-world");
    });

    it("handles special characters", () => {
      expect(toKebabCase("hello_world")).toBe("hello-world");
    });
  });

  describe("CONSTANT_CASE", () => {
    it("converts text to CONSTANT_CASE", () => {
      expect(toConstantCase("hello world")).toBe("HELLO_WORLD");
    });

    it("handles empty string", () => {
      expect(toConstantCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toConstantCase("hello")).toBe("HELLO");
    });

    it("handles multiple words", () => {
      expect(toConstantCase("the quick brown fox")).toBe(
        "THE_QUICK_BROWN_FOX"
      );
    });

    it("handles camelCase input", () => {
      expect(toConstantCase("helloWorld")).toBe("HELLO_WORLD");
    });
  });

  describe("dot.case", () => {
    it("converts text to dot.case", () => {
      expect(toDotCase("hello world")).toBe("hello.world");
    });

    it("handles empty string", () => {
      expect(toDotCase("")).toBe("");
    });

    it("handles single word", () => {
      expect(toDotCase("hello")).toBe("hello");
    });

    it("handles multiple words", () => {
      expect(toDotCase("the quick brown fox")).toBe("the.quick.brown.fox");
    });

    it("handles camelCase input", () => {
      expect(toDotCase("helloWorld")).toBe("hello.world");
    });
  });
});

describe("Slug Generator", () => {
  it("converts spaces to hyphens", () => {
    expect(generateSlug("hello world", "-", true, false)).toBe("hello-world");
  });

  it("removes unicode diacritics", () => {
    expect(generateSlug("cafe\u0301 re\u0301sume\u0301", "-", true, false)).toBe(
      "cafe-resume"
    );
  });

  it("removes diacritics from precomposed characters", () => {
    expect(generateSlug("\u00e9\u00fc\u00f1", "-", true, false)).toBe("eun");
  });

  it("removes special characters", () => {
    expect(generateSlug("hello & world! @2024", "-", true, false)).toBe(
      "hello-world-2024"
    );
  });

  it("enforces lowercase", () => {
    expect(generateSlug("Hello World", "-", true, false)).toBe("hello-world");
  });

  it("preserves case when lowercase is disabled", () => {
    expect(generateSlug("Hello World", "-", false, false)).toBe("Hello-World");
  });

  it("uses underscore separator", () => {
    expect(generateSlug("hello world", "_", true, false)).toBe("hello_world");
  });

  it("uses dot separator", () => {
    expect(generateSlug("hello world", ".", true, false)).toBe("hello.world");
  });

  it("removes stop words", () => {
    expect(generateSlug("the quick and the dead", "-", true, true)).toBe(
      "quick-dead"
    );
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("", "-", true, false)).toBe("");
  });

  it("handles multiple consecutive spaces", () => {
    expect(generateSlug("hello    world", "-", true, false)).toBe(
      "hello-world"
    );
  });

  it("handles leading and trailing spaces", () => {
    expect(generateSlug("  hello world  ", "-", true, false)).toBe(
      "hello-world"
    );
  });

  it("handles input that is only special characters", () => {
    expect(generateSlug("@#$%^&*", "-", true, false)).toBe("");
  });
});

describe("Text Diff", () => {
  it("marks identical texts as all unchanged", () => {
    const diff = computeDiff("hello\nworld", "hello\nworld");
    expect(diff).toHaveLength(2);
    expect(diff.every((line) => line.type === "unchanged")).toBe(true);
    expect(diff[0].content).toBe("hello");
    expect(diff[1].content).toBe("world");
  });

  it("marks completely different texts as removed + added", () => {
    const diff = computeDiff("alpha", "beta");
    const removed = diff.filter((l) => l.type === "removed");
    const added = diff.filter((l) => l.type === "added");
    expect(removed).toHaveLength(1);
    expect(removed[0].content).toBe("alpha");
    expect(added).toHaveLength(1);
    expect(added[0].content).toBe("beta");
  });

  it("detects added lines at end", () => {
    const diff = computeDiff("line1\nline2", "line1\nline2\nline3");
    expect(diff).toHaveLength(3);
    expect(diff[0]).toMatchObject({ type: "unchanged", content: "line1" });
    expect(diff[1]).toMatchObject({ type: "unchanged", content: "line2" });
    expect(diff[2]).toMatchObject({ type: "added", content: "line3" });
  });

  it("detects removed lines from start", () => {
    const diff = computeDiff("line1\nline2\nline3", "line2\nline3");
    expect(diff).toHaveLength(3);
    expect(diff[0]).toMatchObject({ type: "removed", content: "line1" });
    expect(diff[1]).toMatchObject({ type: "unchanged", content: "line2" });
    expect(diff[2]).toMatchObject({ type: "unchanged", content: "line3" });
  });

  it("handles mixed changes", () => {
    const diff = computeDiff("a\nb\nc\nd", "a\nx\nc\ny");
    const types = diff.map((l) => l.type);
    expect(types).toContain("unchanged");
    expect(types).toContain("added");
    expect(types).toContain("removed");
    // "a" and "c" should be unchanged
    const unchanged = diff.filter((l) => l.type === "unchanged");
    expect(unchanged.map((l) => l.content)).toEqual(
      expect.arrayContaining(["a", "c"])
    );
  });

  it("handles empty original (all added)", () => {
    const diff = computeDiff("", "line1\nline2");
    // Empty string splits to [""], so the empty line is removed and line1+line2 are added
    const added = diff.filter((l) => l.type === "added");
    expect(added.map((l) => l.content)).toEqual(
      expect.arrayContaining(["line1", "line2"])
    );
  });

  it("handles empty modified (all removed)", () => {
    const diff = computeDiff("line1\nline2", "");
    const removed = diff.filter((l) => l.type === "removed");
    expect(removed.map((l) => l.content)).toEqual(
      expect.arrayContaining(["line1", "line2"])
    );
  });

  it("handles both inputs empty", () => {
    const diff = computeDiff("", "");
    // Both split to [""], which are identical
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({ type: "unchanged", content: "" });
  });

  it("assigns sequential line numbers", () => {
    const diff = computeDiff("a\nb", "a\nc");
    const lineNumbers = diff.map((l) => l.lineNumber);
    expect(lineNumbers).toEqual([1, 2, 3]);
  });
});
