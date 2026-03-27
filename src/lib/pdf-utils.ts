/**
 * Parse a page range string like "1-3, 5, 8-10" into an array of 0-based page indices.
 * Returns sorted, unique indices within [0, maxPage-1].
 */
export function parsePageRange(input: string, maxPage: number): number[] {
  if (!input.trim()) return [];

  const indices = new Set<number>();
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (isNaN(start) || isNaN(end)) continue;
      const lo = Math.max(1, Math.min(start, end));
      const hi = Math.min(maxPage, Math.max(start, end));
      for (let i = lo; i <= hi; i++) {
        indices.add(i - 1); // Convert to 0-based
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPage) {
        indices.add(num - 1); // Convert to 0-based
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
}
