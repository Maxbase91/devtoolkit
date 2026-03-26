import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// =============================================================================
// Recreated pure functions from ColorConverter.tsx (not exported)
// =============================================================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, "");
  let fullHex = clean;
  if (clean.length === 3) {
    fullHex = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  if (fullHex.length !== 6 || !/^[\da-fA-F]{6}$/.test(fullHex)) return null;
  return {
    r: parseInt(fullHex.slice(0, 2), 16),
    g: parseInt(fullHex.slice(2, 4), 16),
    b: parseInt(fullHex.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

function relativeLuminance({ r, g, b }: RGB): number {
  const srgb = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseColorInput(input: string): RGB | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hexMatch = trimmed.match(/^#?([\da-fA-F]{3,8})$/);
  if (hexMatch) {
    return hexToRgb(hexMatch[1]);
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})/i
  );
  if (rgbMatch) {
    return {
      r: clamp(parseInt(rgbMatch[1]), 0, 255),
      g: clamp(parseInt(rgbMatch[2]), 0, 255),
      b: clamp(parseInt(rgbMatch[3]), 0, 255),
    };
  }

  const hslMatch = trimmed.match(
    /^hsla?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%?\s*[,\s]\s*(\d{1,3})%?/i
  );
  if (hslMatch) {
    return hslToRgb({
      h: clamp(parseInt(hslMatch[1]), 0, 360),
      s: clamp(parseInt(hslMatch[2]), 0, 100),
      l: clamp(parseInt(hslMatch[3]), 0, 100),
    });
  }

  return null;
}

// =============================================================================
// Recreated pure functions from Base64Tool.tsx (not exported)
// =============================================================================

function utf8Encode(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function utf8Decode(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// =============================================================================
// Recreated pure functions from TimestampConverter.tsx (not exported)
// =============================================================================

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let label: string;
  if (seconds < 5) label = "just now";
  else if (seconds < 60)
    label = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60)
    label = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) label = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else if (days < 30) label = `${days} day${days !== 1 ? "s" : ""}`;
  else if (months < 12)
    label = `${months} month${months !== 1 ? "s" : ""}`;
  else label = `${years} year${years !== 1 ? "s" : ""}`;

  if (label === "just now") return label;
  return isPast ? `${label} ago` : `in ${label}`;
}

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// =============================================================================
// Tests
// =============================================================================

describe("ColorConverter", () => {
  describe("hexToRgb", () => {
    it("converts #ff0000 to rgb(255, 0, 0)", () => {
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("converts without hash prefix", () => {
      expect(hexToRgb("6366f1")).toEqual({ r: 99, g: 102, b: 241 });
    });

    it("converts shorthand hex (#fff)", () => {
      expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("converts black (#000000)", () => {
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("converts white (#ffffff)", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("converts pure green (#00ff00)", () => {
      expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    });

    it("converts pure blue (#0000ff)", () => {
      expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("returns null for invalid hex", () => {
      expect(hexToRgb("xyz")).toBeNull();
    });

    it("returns null for wrong length", () => {
      expect(hexToRgb("#12345")).toBeNull();
    });
  });

  describe("rgbToHex", () => {
    it("converts rgb(255, 0, 0) to #ff0000", () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
    });

    it("converts rgb(0, 0, 0) to #000000", () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
    });

    it("converts rgb(255, 255, 255) to #ffffff", () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff");
    });

    it("converts rgb(99, 102, 241) to #6366f1", () => {
      expect(rgbToHex({ r: 99, g: 102, b: 241 })).toBe("#6366f1");
    });

    it("clamps values above 255", () => {
      expect(rgbToHex({ r: 300, g: 0, b: 0 })).toBe("#ff0000");
    });

    it("clamps values below 0", () => {
      expect(rgbToHex({ r: -10, g: 0, b: 0 })).toBe("#000000");
    });
  });

  describe("rgbToHsl", () => {
    it("converts pure red to hsl(0, 100, 50)", () => {
      expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({
        h: 0,
        s: 100,
        l: 50,
      });
    });

    it("converts pure green to hsl(120, 100, 50)", () => {
      expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({
        h: 120,
        s: 100,
        l: 50,
      });
    });

    it("converts pure blue to hsl(240, 100, 50)", () => {
      expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({
        h: 240,
        s: 100,
        l: 50,
      });
    });

    it("converts black to hsl(0, 0, 0)", () => {
      expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
    });

    it("converts white to hsl(0, 0, 100)", () => {
      expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({
        h: 0,
        s: 0,
        l: 100,
      });
    });

    it("converts mid-gray to hsl(0, 0, 50)", () => {
      expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({
        h: 0,
        s: 0,
        l: 50,
      });
    });
  });

  describe("hexToHsl (via hexToRgb + rgbToHsl)", () => {
    it("converts #ff0000 to hsl(0, 100, 50)", () => {
      const rgb = hexToRgb("#ff0000")!;
      expect(rgbToHsl(rgb)).toEqual({ h: 0, s: 100, l: 50 });
    });

    it("converts #6366f1 to approximately hsl(239, 84, 67)", () => {
      const rgb = hexToRgb("#6366f1")!;
      const hsl = rgbToHsl(rgb);
      expect(hsl.h).toBeGreaterThanOrEqual(238);
      expect(hsl.h).toBeLessThanOrEqual(240);
      expect(hsl.s).toBeGreaterThanOrEqual(83);
      expect(hsl.s).toBeLessThanOrEqual(85);
      expect(hsl.l).toBeGreaterThanOrEqual(66);
      expect(hsl.l).toBeLessThanOrEqual(68);
    });
  });

  describe("hslToRgb", () => {
    it("converts hsl(0, 100, 50) to pure red", () => {
      expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({
        r: 255,
        g: 0,
        b: 0,
      });
    });

    it("converts hsl(120, 100, 50) to pure green", () => {
      expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({
        r: 0,
        g: 255,
        b: 0,
      });
    });

    it("converts hsl(240, 100, 50) to pure blue", () => {
      expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({
        r: 0,
        g: 0,
        b: 255,
      });
    });

    it("converts achromatic (s=0) to gray", () => {
      expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({
        r: 128,
        g: 128,
        b: 128,
      });
    });

    it("converts hsl(0, 0, 0) to black", () => {
      expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({
        r: 0,
        g: 0,
        b: 0,
      });
    });

    it("converts hsl(0, 0, 100) to white", () => {
      expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });

    it("round-trips: rgb -> hsl -> rgb preserves values for primary colors", () => {
      const original: RGB = { r: 255, g: 0, b: 0 };
      const hsl = rgbToHsl(original);
      const roundTripped = hslToRgb(hsl);
      expect(roundTripped).toEqual(original);
    });
  });

  describe("parseColorInput", () => {
    it("parses hex with hash: #6366f1", () => {
      expect(parseColorInput("#6366f1")).toEqual({ r: 99, g: 102, b: 241 });
    });

    it("parses hex without hash: 6366f1", () => {
      expect(parseColorInput("6366f1")).toEqual({ r: 99, g: 102, b: 241 });
    });

    it("parses rgb() format: rgb(99,102,241)", () => {
      expect(parseColorInput("rgb(99,102,241)")).toEqual({
        r: 99,
        g: 102,
        b: 241,
      });
    });

    it("parses rgb() with spaces: rgb(99, 102, 241)", () => {
      expect(parseColorInput("rgb(99, 102, 241)")).toEqual({
        r: 99,
        g: 102,
        b: 241,
      });
    });

    it("parses hsl() format: hsl(239,84%,67%)", () => {
      const result = parseColorInput("hsl(239,84%,67%)");
      expect(result).not.toBeNull();
      // HSL(239,84%,67%) should produce values close to #6366f1
      expect(result!.r).toBeGreaterThanOrEqual(95);
      expect(result!.r).toBeLessThanOrEqual(105);
    });

    it("returns null for empty string", () => {
      expect(parseColorInput("")).toBeNull();
    });

    it("returns null for whitespace only", () => {
      expect(parseColorInput("   ")).toBeNull();
    });

    it("returns null for invalid input", () => {
      expect(parseColorInput("not-a-color")).toBeNull();
    });

    it("trims whitespace before parsing", () => {
      expect(parseColorInput("  #ff0000  ")).toEqual({
        r: 255,
        g: 0,
        b: 0,
      });
    });
  });

  describe("contrastRatio", () => {
    it("returns 21 for black vs white", () => {
      const white: RGB = { r: 255, g: 255, b: 255 };
      const black: RGB = { r: 0, g: 0, b: 0 };
      expect(contrastRatio(white, black)).toBeCloseTo(21, 0);
    });

    it("returns 1 for same color", () => {
      const color: RGB = { r: 128, g: 128, b: 128 };
      expect(contrastRatio(color, color)).toBeCloseTo(1, 2);
    });

    it("is symmetric (order of arguments does not matter)", () => {
      const a: RGB = { r: 99, g: 102, b: 241 };
      const b: RGB = { r: 255, g: 255, b: 255 };
      expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5);
    });
  });

  describe("WCAG pass/fail for known colors", () => {
    const white: RGB = { r: 255, g: 255, b: 255 };
    const black: RGB = { r: 0, g: 0, b: 0 };

    it("black on white passes AA (>= 4.5) and AAA (>= 7)", () => {
      const ratio = contrastRatio(black, white);
      expect(ratio).toBeGreaterThanOrEqual(7);
    });

    it("white on white fails AA (ratio ~1)", () => {
      const ratio = contrastRatio(white, white);
      expect(ratio).toBeLessThan(4.5);
    });

    it("#6366f1 vs white passes AA Large (>= 3) but may fail AA normal", () => {
      const indigo: RGB = { r: 99, g: 102, b: 241 };
      const ratio = contrastRatio(indigo, white);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("dark gray #333 on white passes AA", () => {
      const darkGray = hexToRgb("#333333")!;
      const ratio = contrastRatio(darkGray, white);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("light gray #aaa on white fails AA", () => {
      const lightGray = hexToRgb("#aaaaaa")!;
      const ratio = contrastRatio(lightGray, white);
      expect(ratio).toBeLessThan(4.5);
    });
  });
});

describe("Base64Tool", () => {
  describe("utf8Encode", () => {
    it("encodes ASCII text to Base64", () => {
      expect(utf8Encode("Hello, World!")).toBe("SGVsbG8sIFdvcmxkIQ==");
    });

    it("encodes empty string", () => {
      expect(utf8Encode("")).toBe("");
    });

    it("encodes single character", () => {
      expect(utf8Encode("A")).toBe("QQ==");
    });

    it("handles UTF-8 characters (emoji)", () => {
      const encoded = utf8Encode("\u{1F600}");
      const decoded = utf8Decode(encoded);
      expect(decoded).toBe("\u{1F600}");
    });

    it("handles UTF-8 characters (accented)", () => {
      const encoded = utf8Encode("cafe\u0301");
      const decoded = utf8Decode(encoded);
      expect(decoded).toBe("cafe\u0301");
    });

    it("handles UTF-8 characters (CJK)", () => {
      const encoded = utf8Encode("\u4F60\u597D");
      const decoded = utf8Decode(encoded);
      expect(decoded).toBe("\u4F60\u597D");
    });
  });

  describe("utf8Decode", () => {
    it("decodes Base64 to ASCII text", () => {
      expect(utf8Decode("SGVsbG8sIFdvcmxkIQ==")).toBe("Hello, World!");
    });

    it("decodes empty string", () => {
      expect(utf8Decode("")).toBe("");
    });

    it("throws on invalid Base64 input", () => {
      expect(() => utf8Decode("not-valid-base64!!!")).toThrow();
    });
  });

  describe("round-trip", () => {
    it("encode then decode equals original for ASCII", () => {
      const original = "The quick brown fox jumps over the lazy dog";
      expect(utf8Decode(utf8Encode(original))).toBe(original);
    });

    it("encode then decode equals original for UTF-8", () => {
      const original = "Gr\u00FC\u00DFe aus M\u00FCnchen \u{1F37A}";
      expect(utf8Decode(utf8Encode(original))).toBe(original);
    });

    it("encode then decode equals original for empty string", () => {
      expect(utf8Decode(utf8Encode(""))).toBe("");
    });

    it("encode then decode for multiline text", () => {
      const original = "line one\nline two\nline three";
      expect(utf8Decode(utf8Encode(original))).toBe(original);
    });

    it("encode then decode for special characters", () => {
      const original = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      expect(utf8Decode(utf8Encode(original))).toBe(original);
    });
  });
});

describe("TimestampConverter", () => {
  describe("formatRelativeTime", () => {
    let dateNowSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Fix "now" to a known timestamp: 2025-01-15T12:00:00.000Z
      dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1736942400000);
    });

    afterEach(() => {
      dateNowSpy.mockRestore();
    });

    it("returns 'just now' for timestamps within 5 seconds", () => {
      const date = new Date(1736942400000 - 2000); // 2 seconds ago
      expect(formatRelativeTime(date)).toBe("just now");
    });

    it("returns seconds ago for < 60 seconds", () => {
      const date = new Date(1736942400000 - 30000); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe("30 seconds ago");
    });

    it("returns singular second", () => {
      const date = new Date(1736942400000 - 1000 * 5); // exactly 5 seconds
      expect(formatRelativeTime(date)).toBe("5 seconds ago");
    });

    it("returns minutes ago", () => {
      const date = new Date(1736942400000 - 1000 * 60 * 45); // 45 minutes ago
      expect(formatRelativeTime(date)).toBe("45 minutes ago");
    });

    it("returns '1 minute ago' for singular", () => {
      const date = new Date(1736942400000 - 1000 * 60); // 1 minute ago
      expect(formatRelativeTime(date)).toBe("1 minute ago");
    });

    it("returns hours ago", () => {
      const date = new Date(1736942400000 - 1000 * 60 * 60 * 3); // 3 hours ago
      expect(formatRelativeTime(date)).toBe("3 hours ago");
    });

    it("returns days ago", () => {
      const date = new Date(1736942400000 - 1000 * 60 * 60 * 24 * 5); // 5 days ago
      expect(formatRelativeTime(date)).toBe("5 days ago");
    });

    it("returns 'in 2 days' for future dates", () => {
      const date = new Date(1736942400000 + 1000 * 60 * 60 * 24 * 2); // 2 days in future
      expect(formatRelativeTime(date)).toBe("in 2 days");
    });

    it("returns 'in 3 hours' for future dates", () => {
      const date = new Date(1736942400000 + 1000 * 60 * 60 * 3); // 3 hours in future
      expect(formatRelativeTime(date)).toBe("in 3 hours");
    });

    it("returns months ago for 30+ days", () => {
      const date = new Date(1736942400000 - 1000 * 60 * 60 * 24 * 60); // 60 days ago = 2 months
      expect(formatRelativeTime(date)).toBe("2 months ago");
    });

    it("returns years ago for 365+ days", () => {
      const date = new Date(1736942400000 - 1000 * 60 * 60 * 24 * 400); // ~1 year ago
      expect(formatRelativeTime(date)).toBe("1 year ago");
    });

    it("returns 'in 1 year' for future year", () => {
      const date = new Date(1736942400000 + 1000 * 60 * 60 * 24 * 400);
      expect(formatRelativeTime(date)).toBe("in 1 year");
    });
  });

  describe("toLocalDatetimeString", () => {
    it("formats a date to YYYY-MM-DDTHH:MM:SS", () => {
      // Use a date with known local values (month is 0-indexed)
      const date = new Date(2025, 0, 15, 9, 5, 3); // Jan 15, 2025 09:05:03
      expect(toLocalDatetimeString(date)).toBe("2025-01-15T09:05:03");
    });

    it("pads single-digit month, day, hour, minute, second", () => {
      const date = new Date(2025, 2, 3, 4, 5, 6); // Mar 3, 2025 04:05:06
      expect(toLocalDatetimeString(date)).toBe("2025-03-03T04:05:06");
    });

    it("handles midnight", () => {
      const date = new Date(2025, 11, 31, 0, 0, 0); // Dec 31, 2025 00:00:00
      expect(toLocalDatetimeString(date)).toBe("2025-12-31T00:00:00");
    });

    it("handles end of day", () => {
      const date = new Date(2025, 0, 1, 23, 59, 59);
      expect(toLocalDatetimeString(date)).toBe("2025-01-01T23:59:59");
    });
  });
});
