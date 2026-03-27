import { describe, it, expect } from "vitest";
import { CATEGORIES, SITE_URL } from "@/lib/constants";

describe("CATEGORIES", () => {
  const categoryKeys = Object.keys(CATEGORIES);

  it("defines all 6 categories", () => {
    expect(categoryKeys).toHaveLength(6);
    expect(categoryKeys).toContain("text");
    expect(categoryKeys).toContain("developer");
    expect(categoryKeys).toContain("data");
    expect(categoryKeys).toContain("crypto");
    expect(categoryKeys).toContain("document");
    expect(categoryKeys).toContain("utility");
  });

  it.each(["text", "developer", "data", "crypto", "document", "utility"] as const)(
    "%s has label, description, color, and bgColor",
    (key) => {
      const category = CATEGORIES[key];
      expect(category.label).toBeDefined();
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.description).toBeDefined();
      expect(category.description.length).toBeGreaterThan(0);
      expect(category.color).toBeDefined();
      expect(category.color.length).toBeGreaterThan(0);
      expect(category.bgColor).toBeDefined();
      expect(category.bgColor.length).toBeGreaterThan(0);
    }
  );
});

describe("SITE_URL", () => {
  it("is a valid URL string", () => {
    expect(() => new URL(SITE_URL)).not.toThrow();
  });

  it("uses https protocol", () => {
    const url = new URL(SITE_URL);
    expect(url.protocol).toBe("https:");
  });
});
