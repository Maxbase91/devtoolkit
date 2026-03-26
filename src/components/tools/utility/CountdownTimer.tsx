"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const totalMs = targetDate.getTime() - Date.now();
  const absTotalMs = Math.abs(totalMs);
  const days = Math.floor(absTotalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absTotalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absTotalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absTotalMs % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, totalMs };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const [eventName, setEventName] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("00:00");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { copied, copy } = useClipboard();

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const date = params.get("date");
    const time = params.get("time");
    if (name) setEventName(decodeURIComponent(name));
    if (date) setDateStr(date);
    if (time) setTimeStr(time);
    setInitialized(true);
  }, []);

  const targetDate = useMemo(() => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T${timeStr || "00:00"}`);
    return isNaN(d.getTime()) ? null : d;
  }, [dateStr, timeStr]);

  // Tick every second
  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(calculateTimeLeft(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleShare = useCallback(() => {
    const params = new URLSearchParams();
    if (eventName) params.set("name", eventName);
    if (dateStr) params.set("date", dateStr);
    if (timeStr && timeStr !== "00:00") params.set("time", timeStr);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    copy(url);
  }, [eventName, dateStr, timeStr, copy]);

  const isPast = timeLeft !== null && timeLeft.totalMs < 0;

  if (!initialized) return null;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Event name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="My Event"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Date</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Time</label>
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Share button */}
      {dateStr && (
        <button
          onClick={handleShare}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          {copied ? "Link copied!" : "Share countdown"}
        </button>
      )}

      {/* Countdown display */}
      {timeLeft !== null ? (
        <div className="rounded-md border border-border bg-surface p-8 text-center">
          {eventName && (
            <p className="mb-4 text-lg font-medium text-muted">{eventName}</p>
          )}
          {isPast && (
            <p className="mb-2 text-sm text-muted">This event was</p>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-center gap-2 sm:gap-4">
                {i > 0 && (
                  <span className="text-2xl font-light text-muted sm:text-4xl">:</span>
                )}
                <div className="flex flex-col items-center">
                  <span className={cn(
                    "font-mono text-3xl font-bold sm:text-5xl",
                    isPast ? "text-muted" : "text-foreground"
                  )}>
                    {pad(value)}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-wider text-muted">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {isPast && (
            <p className="mt-4 text-sm text-muted">ago</p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-md border border-border bg-surface p-12">
          <p className="text-muted">Select a date to start the countdown</p>
        </div>
      )}
    </div>
  );
}
