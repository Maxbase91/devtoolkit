import { describe, it, expect } from "vitest";
import {
  tools,
  getToolBySlug,
  getToolsByCategory,
  searchTools,
} from "@/lib/tools-registry";

describe("getToolBySlug", () => {
  it("returns the correct tool for a valid slug", () => {
    const tool = getToolBySlug("json-formatter");
    expect(tool).toBeDefined();
    expect(tool!.name).toBe("JSON Formatter & Validator");
    expect(tool!.category).toBe("developer");
  });

  it("returns undefined for an invalid slug", () => {
    const tool = getToolBySlug("nonexistent-tool");
    expect(tool).toBeUndefined();
  });
});

describe("getToolsByCategory", () => {
  it("returns only tools of the specified category", () => {
    const textTools = getToolsByCategory("text");
    expect(textTools.every((t) => t.category === "text")).toBe(true);
  });

  it("returns 6 text tools", () => {
    expect(getToolsByCategory("text")).toHaveLength(6);
  });

  it("returns 9 developer tools", () => {
    expect(getToolsByCategory("developer")).toHaveLength(9);
  });

  it("returns 5 data tools", () => {
    expect(getToolsByCategory("data")).toHaveLength(5);
  });

  it("returns 3 crypto tools", () => {
    expect(getToolsByCategory("crypto")).toHaveLength(3);
  });

  it("returns 7 image tools", () => {
    expect(getToolsByCategory("image")).toHaveLength(7);
  });

  it("returns 5 document tools", () => {
    expect(getToolsByCategory("document")).toHaveLength(5);
  });

  it("returns 5 utility tools", () => {
    expect(getToolsByCategory("utility")).toHaveLength(5);
  });
});

describe("searchTools", () => {
  it("returns all tools when query is empty", () => {
    expect(searchTools("")).toHaveLength(tools.length);
  });

  it("returns all tools when query is only whitespace", () => {
    expect(searchTools("   ")).toHaveLength(tools.length);
  });

  it("matches by name", () => {
    const results = searchTools("Password Generator");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.slug === "password-generator")).toBe(true);
  });

  it("matches by tags", () => {
    const results = searchTools("camelCase");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.slug === "case-converter")).toBe(true);
  });

  it("matches by description", () => {
    const results = searchTools("placeholder text");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.slug === "lorem-ipsum")).toBe(true);
  });

  it("returns empty array for gibberish query", () => {
    const results = searchTools("xyzzy99qqq");
    expect(results).toHaveLength(0);
  });
});

describe("tool data integrity", () => {
  it("all tools have unique slugs", () => {
    const slugs = tools.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all tools have non-empty metaTitle and metaDescription", () => {
    for (const tool of tools) {
      expect(tool.metaTitle.length, `${tool.slug} metaTitle`).toBeGreaterThan(0);
      expect(tool.metaDescription.length, `${tool.slug} metaDescription`).toBeGreaterThan(0);
    }
  });

  it("all metaDescriptions are under 160 characters", () => {
    for (const tool of tools) {
      expect(
        tool.metaDescription.length,
        `${tool.slug} metaDescription is ${tool.metaDescription.length} chars`
      ).toBeLessThanOrEqual(160);
    }
  });

  it("all tools have at least one tag", () => {
    for (const tool of tools) {
      expect(tool.tags.length, `${tool.slug} has no tags`).toBeGreaterThanOrEqual(1);
    }
  });

  it("all tool slugs match URL-safe pattern (lowercase, hyphens only)", () => {
    const urlSafePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    for (const tool of tools) {
      expect(
        urlSafePattern.test(tool.slug),
        `${tool.slug} is not URL-safe`
      ).toBe(true);
    }
  });
});
