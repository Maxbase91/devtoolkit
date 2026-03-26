"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

type Unit = "seconds" | "milliseconds";

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
  else if (seconds < 60) label = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60) label = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) label = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else if (days < 30) label = `${days} day${days !== 1 ? "s" : ""}`;
  else if (months < 12) label = `${months} month${months !== 1 ? "s" : ""}`;
  else label = `${years} year${years !== 1 ? "s" : ""}`;

  if (label === "just now") return label;
  return isPast ? `${label} ago` : `in ${label}`;
}

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getTimezoneDisplay(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const sign = offset <= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const mins = absOffset % 60;
    return `${tz} (UTC${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")})`;
  } catch {
    return "Unknown";
  }
}

export default function TimestampConverter() {
  const [unit, setUnit] = useState<Unit>("seconds");
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState(() =>
    toLocalDatetimeString(new Date())
  );
  const [now, setNow] = useState(() => Date.now());

  // Live ticking clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTimestamp = useMemo(
    () => (unit === "seconds" ? Math.floor(now / 1000) : now),
    [now, unit]
  );

  // Parse timestamp → date
  const parsedDate = useMemo(() => {
    if (!timestampInput.trim()) return null;
    const num = Number(timestampInput);
    if (isNaN(num)) return null;
    const ms = unit === "seconds" ? num * 1000 : num;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return null;
    return date;
  }, [timestampInput, unit]);

  // Parse date → timestamp
  const dateTimestamp = useMemo(() => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return unit === "seconds"
      ? Math.floor(date.getTime() / 1000)
      : date.getTime();
  }, [dateInput, unit]);

  const dateFromPicker = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }, [dateInput]);

  const handleUseNow = useCallback(() => {
    const current = Date.now();
    setTimestampInput(
      String(unit === "seconds" ? Math.floor(current / 1000) : current)
    );
    setDateInput(toLocalDatetimeString(new Date(current)));
  }, [unit]);

  const timezone = useMemo(() => getTimezoneDisplay(), []);

  return (
    <div className="space-y-6">
      {/* Unit toggle + current time */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-border text-sm">
          <button
            onClick={() => setUnit("seconds")}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              unit === "seconds"
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            Seconds
          </button>
          <button
            onClick={() => setUnit("milliseconds")}
            className={cn(
              "px-4 py-1.5 font-medium transition-colors",
              unit === "milliseconds"
                ? "bg-accent text-white"
                : "hover:bg-surface"
            )}
          >
            Milliseconds
          </button>
        </div>
        <button
          onClick={handleUseNow}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          Use Now
        </button>
        <span className="text-xs text-muted">{timezone}</span>
      </div>

      {/* Current timestamp (live) */}
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted">
              Current Unix Timestamp ({unit})
            </p>
            <p className="font-mono text-2xl tabular-nums text-foreground">
              {currentTimestamp}
            </p>
          </div>
          <CopyButton text={String(currentTimestamp)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section 1: Timestamp → Human date */}
        <div className="space-y-3 rounded-md border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Timestamp to Date
          </h3>
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder={unit === "seconds" ? "e.g. 1700000000" : "e.g. 1700000000000"}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {timestampInput.trim() && !parsedDate && (
            <p className="text-sm text-error">Invalid timestamp</p>
          )}
          {parsedDate && (
            <div className="space-y-2">
              <OutputRow
                label="Local"
                value={parsedDate.toLocaleString()}
              />
              <OutputRow
                label="UTC"
                value={parsedDate.toUTCString()}
              />
              <OutputRow
                label="ISO 8601"
                value={parsedDate.toISOString()}
              />
              <OutputRow
                label="Relative"
                value={formatRelativeTime(parsedDate)}
              />
            </div>
          )}
        </div>

        {/* Section 2: Date → Timestamp */}
        <div className="space-y-3 rounded-md border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Date to Timestamp
          </h3>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            step="1"
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {dateTimestamp !== null && (
            <div className="space-y-2">
              <OutputRow
                label={`Unix (${unit})`}
                value={String(dateTimestamp)}
              />
              {dateFromPicker && (
                <>
                  <OutputRow
                    label="ISO 8601"
                    value={dateFromPicker.toISOString()}
                  />
                  <OutputRow
                    label="Relative"
                    value={formatRelativeTime(dateFromPicker)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OutputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-sm bg-background px-2 py-1.5">
      <div className="min-w-0">
        <span className="text-xs text-muted">{label}</span>
        <p className="truncate font-mono text-sm text-foreground">{value}</p>
      </div>
      <CopyButton text={value} className="shrink-0" />
    </div>
  );
}
