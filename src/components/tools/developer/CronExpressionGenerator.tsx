"use client";

import { useState, useMemo, useCallback } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";

interface Preset {
  label: string;
  expression: string;
}

const PRESETS: Preset[] = [
  { label: "Every minute", expression: "* * * * *" },
  { label: "Every hour", expression: "0 * * * *" },
  { label: "Daily at midnight", expression: "0 0 * * *" },
  { label: "Weekly on Monday", expression: "0 0 * * 1" },
  { label: "Monthly on 1st", expression: "0 0 1 * *" },
];

const MINUTE_OPTIONS = [
  { label: "Every minute", value: "*" },
  { label: "Every 5 minutes", value: "*/5" },
  { label: "Every 10 minutes", value: "*/10" },
  { label: "Every 15 minutes", value: "*/15" },
  { label: "Every 30 minutes", value: "*/30" },
  { label: "0", value: "0" },
  { label: "15", value: "15" },
  { label: "30", value: "30" },
  { label: "45", value: "45" },
];

const HOUR_OPTIONS = [
  { label: "Every hour", value: "*" },
  { label: "Every 2 hours", value: "*/2" },
  { label: "Every 6 hours", value: "*/6" },
  { label: "Every 12 hours", value: "*/12" },
  ...Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, "0")}:00`,
    value: String(i),
  })),
];

const DAY_OPTIONS = [
  { label: "Every day", value: "*" },
  { label: "1st", value: "1" },
  { label: "15th", value: "15" },
  ...Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  })),
];

const MONTH_OPTIONS = [
  { label: "Every month", value: "*" },
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const WEEKDAY_OPTIONS = [
  { label: "Every day", value: "*" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
  { label: "Sunday", value: "0" },
  { label: "Mon-Fri", value: "1-5" },
  { label: "Sat-Sun", value: "0,6" },
];

function getNextRuns(expression: string, count: number): Date[] {
  try {
    const interval = CronExpressionParser.parse(expression);
    const runs: Date[] = [];
    for (let i = 0; i < count; i++) {
      runs.push(interval.next().toDate());
    }
    return runs;
  } catch {
    return [];
  }
}

function getDescription(expression: string): string {
  try {
    return cronstrue.toString(expression, { use24HourTimeFormat: true });
  } catch {
    return "";
  }
}

export default function CronExpressionGenerator() {
  const [expression, setExpression] = useState("* * * * *");

  const fields = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    return {
      minute: parts[0] ?? "*",
      hour: parts[1] ?? "*",
      day: parts[2] ?? "*",
      month: parts[3] ?? "*",
      weekday: parts[4] ?? "*",
    };
  }, [expression]);

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      const parts = expression.trim().split(/\s+/);
      while (parts.length < 5) parts.push("*");
      const index = ["minute", "hour", "day", "month", "weekday"].indexOf(
        field
      );
      if (index >= 0) {
        parts[index] = value;
        setExpression(parts.join(" "));
      }
    },
    [expression]
  );

  const description = useMemo(() => getDescription(expression), [expression]);

  const { nextRuns, parseError } = useMemo(() => {
    try {
      CronExpressionParser.parse(expression);
      return { nextRuns: getNextRuns(expression, 10), parseError: null };
    } catch (err) {
      return {
        nextRuns: [],
        parseError: err instanceof Error ? err.message : "Invalid expression",
      };
    }
  }, [expression]);

  const isValid = !parseError;

  return (
    <div className="space-y-4">
      {/* Expression input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            spellCheck={false}
            className={cn(
              "flex-1 rounded-md border bg-surface px-3 py-2 font-mono text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent",
              isValid ? "border-border" : "border-error"
            )}
          />
          <CopyButton text={expression} />
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span>minute</span>
          <span>hour</span>
          <span>day (month)</span>
          <span>month</span>
          <span>day (week)</span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="text-sm text-foreground">{description}</p>
        </div>
      )}
      {parseError && <p className="text-sm text-error">{parseError}</p>}

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">Presets</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.expression}
              onClick={() => setExpression(preset.expression)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                expression === preset.expression
                  ? "border-accent bg-accent text-white"
                  : "border-border hover:bg-surface"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual builder */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted">
          Visual Builder
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Minute", field: "minute", options: MINUTE_OPTIONS },
            { label: "Hour", field: "hour", options: HOUR_OPTIONS },
            { label: "Day of Month", field: "day", options: DAY_OPTIONS },
            { label: "Month", field: "month", options: MONTH_OPTIONS },
            { label: "Day of Week", field: "weekday", options: WEEKDAY_OPTIONS },
          ].map(({ label, field, options }) => (
            <div key={field} className="space-y-1">
              <label className="text-xs text-muted">{label}</label>
              <select
                value={
                  options.some(
                    (o) => o.value === fields[field as keyof typeof fields]
                  )
                    ? fields[field as keyof typeof fields]
                    : ""
                }
                onChange={(e) => handleFieldChange(field, e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {!options.some(
                  (o) => o.value === fields[field as keyof typeof fields]
                ) && (
                  <option value="" disabled>
                    {fields[field as keyof typeof fields]}
                  </option>
                )}
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">
            Next 10 Run Times
          </label>
          <div className="rounded-md border border-border bg-surface">
            <ul className="divide-y divide-border">
              {nextRuns.map((date, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <span className="w-6 text-right font-mono text-muted">
                    {index + 1}.
                  </span>
                  <span className="font-mono text-foreground">
                    {date.toLocaleString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
