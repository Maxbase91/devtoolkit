import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/constants";

describe("sitemap", () => {
  const entries = sitemap();

  it("returns an array with 31 entries (1 homepage + 1 about + 29 tools)", () => {
    expect(entries).toHaveLength(31);
  });

  it("homepage has priority 1", () => {
    const homepage = entries.find((e) => e.url === SITE_URL);
    expect(homepage).toBeDefined();
    expect(homepage!.priority).toBe(1);
  });

  it("all tool URLs follow the pattern /tools/{slug}", () => {
    const toolEntries = entries.filter(
      (e) => e.url !== SITE_URL && e.url !== `${SITE_URL}/about`
    );
    const toolUrlPattern = new RegExp(`^${SITE_URL}/tools/[a-z0-9-]+$`);
    for (const entry of toolEntries) {
      expect(toolUrlPattern.test(entry.url), `${entry.url} does not match tool URL pattern`).toBe(
        true
      );
    }
  });

  it("about page is included", () => {
    const aboutPage = entries.find((e) => e.url === `${SITE_URL}/about`);
    expect(aboutPage).toBeDefined();
  });
});
