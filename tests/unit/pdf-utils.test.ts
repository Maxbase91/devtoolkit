import { describe, it, expect } from "vitest";
import { parsePageRange, formatBytes } from "@/lib/pdf-utils";

describe("parsePageRange", () => {
  it("parses single page numbers", () => {
    expect(parsePageRange("1", 10)).toEqual([0]);
    expect(parsePageRange("5", 10)).toEqual([4]);
  });

  it("parses comma-separated pages", () => {
    expect(parsePageRange("1, 3, 5", 10)).toEqual([0, 2, 4]);
  });

  it("parses page ranges", () => {
    expect(parsePageRange("1-3", 10)).toEqual([0, 1, 2]);
    expect(parsePageRange("5-8", 10)).toEqual([4, 5, 6, 7]);
  });

  it("parses mixed ranges and single pages", () => {
    expect(parsePageRange("1-3, 5, 8-10", 10)).toEqual([0, 1, 2, 4, 7, 8, 9]);
  });

  it("removes duplicates and sorts", () => {
    expect(parsePageRange("3, 1, 3, 2", 10)).toEqual([0, 1, 2]);
  });

  it("clamps to maxPage", () => {
    expect(parsePageRange("1-100", 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("ignores pages below 1", () => {
    expect(parsePageRange("0, -1, 1", 10)).toEqual([0]);
  });

  it("handles reversed ranges", () => {
    expect(parsePageRange("3-1", 10)).toEqual([0, 1, 2]);
  });

  it("returns empty array for empty input", () => {
    expect(parsePageRange("", 10)).toEqual([]);
    expect(parsePageRange("   ", 10)).toEqual([]);
  });

  it("ignores invalid entries", () => {
    expect(parsePageRange("abc, 1, xyz", 10)).toEqual([0]);
  });

  it("handles single page document", () => {
    expect(parsePageRange("1", 1)).toEqual([0]);
    expect(parsePageRange("2", 1)).toEqual([]);
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
    expect(formatBytes(2621440)).toBe("2.5 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1.0 GB");
  });
});
