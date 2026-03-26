"use client";

import { useState, useMemo, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

// --- Color types ---
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
interface HSB {
  h: number;
  s: number;
  b: number;
}

// --- Conversion functions ---

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

function rgbToHsb({ r, g, b }: RGB): HSB {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const brightness = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(brightness * 100),
  };
}

// --- Contrast ratio (WCAG) ---

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

// --- Input parsing ---

function parseColorInput(input: string): RGB | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // HEX: #6366f1, 6366f1, #fff
  const hexMatch = trimmed.match(/^#?([\da-fA-F]{3,8})$/);
  if (hexMatch) {
    return hexToRgb(hexMatch[1]);
  }

  // RGB: rgb(99, 102, 241) or 99, 102, 241
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

  // HSL: hsl(239, 84%, 67%)
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

// --- Badge component ---
function WcagBadge({ ratio, threshold, label }: { ratio: number; threshold: number; label: string }) {
  const pass = ratio >= threshold;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold",
        pass
          ? "bg-success/15 text-success"
          : "bg-error/15 text-error"
      )}
    >
      {label} {pass ? "Pass" : "Fail"}
    </span>
  );
}

export default function ColorConverter() {
  const [input, setInput] = useState("#6366f1");

  const rgb = useMemo(() => parseColorInput(input), [input]);

  const hex = useMemo(() => (rgb ? rgbToHex(rgb) : null), [rgb]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb]);
  const hsb = useMemo(() => (rgb ? rgbToHsb(rgb) : null), [rgb]);

  const whiteContrast = useMemo(
    () => (rgb ? contrastRatio(rgb, { r: 255, g: 255, b: 255 }) : null),
    [rgb]
  );
  const blackContrast = useMemo(
    () => (rgb ? contrastRatio(rgb, { r: 0, g: 0, b: 0 }) : null),
    [rgb]
  );

  const handlePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const hexStr = hex ?? "";
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "";
  const hsbStr = hsb ? `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)` : "";

  return (
    <div className="space-y-6">
      {/* Input row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium text-muted">
            Color Input (HEX, RGB, or HSL)
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#6366f1, rgb(99,102,241), hsl(239,84%,67%)"
            spellCheck={false}
            className={cn(
              "w-full rounded-md border bg-surface px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
              !rgb && input.trim() ? "border-error" : "border-border"
            )}
          />
          {!rgb && input.trim() && (
            <p className="text-sm text-error">Could not parse color</p>
          )}
        </div>
        <input
          type="color"
          value={hex ?? "#000000"}
          onChange={handlePickerChange}
          className="h-10 w-14 cursor-pointer rounded-md border border-border bg-surface"
        />
      </div>

      {/* Swatch preview */}
      {rgb && (
        <div
          className="h-24 w-full rounded-md border border-border"
          style={{ backgroundColor: hexStr }}
        />
      )}

      {/* Format outputs */}
      {rgb && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "HEX", value: hexStr },
            { label: "RGB", value: rgbStr },
            { label: "HSL", value: hslStr },
            { label: "HSB", value: hsbStr },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
            >
              <div>
                <span className="text-xs font-medium text-muted">{label}</span>
                <p className="font-mono text-sm text-foreground">{value}</p>
              </div>
              <CopyButton text={value} />
            </div>
          ))}
        </div>
      )}

      {/* Contrast ratio */}
      {rgb && whiteContrast !== null && blackContrast !== null && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted">
            Contrast Ratio (WCAG)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* vs White */}
            <div className="rounded-md border border-border bg-surface p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-5 w-5 rounded-sm border border-border bg-white" />
                <span className="text-sm text-foreground">
                  vs White — {whiteContrast.toFixed(2)}:1
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <WcagBadge ratio={whiteContrast} threshold={4.5} label="AA" />
                <WcagBadge ratio={whiteContrast} threshold={7} label="AAA" />
                <WcagBadge
                  ratio={whiteContrast}
                  threshold={3}
                  label="AA Large"
                />
              </div>
            </div>
            {/* vs Black */}
            <div className="rounded-md border border-border bg-surface p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-5 w-5 rounded-sm border border-border bg-black" />
                <span className="text-sm text-foreground">
                  vs Black — {blackContrast.toFixed(2)}:1
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <WcagBadge ratio={blackContrast} threshold={4.5} label="AA" />
                <WcagBadge ratio={blackContrast} threshold={7} label="AAA" />
                <WcagBadge
                  ratio={blackContrast}
                  threshold={3}
                  label="AA Large"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
