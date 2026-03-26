"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  dayOfWeek: string;
  zodiac: string;
  daysUntilNextBirthday: number;
}

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

const ZODIAC_SIGNS: { sign: string; start: [number, number]; end: [number, number] }[] = [
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
];

function getZodiacSign(month: number, day: number): string {
  for (const { sign, start, end } of ZODIAC_SIGNS) {
    if (sign === "Capricorn") {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return sign;
    } else {
      if (
        (month === start[0] && day >= start[1]) ||
        (month === end[0] && day <= end[1])
      ) {
        return sign;
      }
    }
  }
  return "Unknown";
}

function calculateAge(birthDate: Date, now: Date): AgeResult {
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  let years = now.getFullYear() - birthYear;
  let months = now.getMonth() - birthMonth;
  let days = now.getDate() - birthDay;

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMs = now.getTime() - birthDate.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));

  const dayOfWeek = DAYS_OF_WEEK[birthDate.getDay()];
  const zodiac = getZodiacSign(birthMonth + 1, birthDay);

  // Days until next birthday
  let nextBirthday = new Date(now.getFullYear(), birthMonth, birthDay);
  if (nextBirthday.getTime() <= now.getTime()) {
    nextBirthday = new Date(now.getFullYear() + 1, birthMonth, birthDay);
  }
  const daysUntilNextBirthday = Math.ceil(
    (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    years,
    months,
    days,
    totalDays,
    totalHours,
    dayOfWeek,
    zodiac,
    daysUntilNextBirthday,
  };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function AgeCalculator() {
  const [birthDateStr, setBirthDateStr] = useState("");

  const result = useMemo(() => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr + "T00:00:00");
    if (isNaN(birthDate.getTime())) return null;
    const now = new Date();
    if (birthDate > now) return null;
    return calculateAge(birthDate, now);
  }, [birthDateStr]);

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted">Date of birth</label>
        <input
          type="date"
          value={birthDateStr}
          onChange={(e) => setBirthDateStr(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent sm:max-w-xs"
        />
      </div>

      {result ? (
        <>
          {/* Primary age display */}
          <div className="rounded-md border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted">You are</p>
            <div className="mt-2 flex items-baseline justify-center gap-4">
              <div>
                <span className="font-mono text-4xl font-bold text-foreground">{result.years}</span>
                <span className="ml-1 text-sm text-muted">years</span>
              </div>
              <div>
                <span className="font-mono text-4xl font-bold text-foreground">{result.months}</span>
                <span className="ml-1 text-sm text-muted">months</span>
              </div>
              <div>
                <span className="font-mono text-4xl font-bold text-foreground">{result.days}</span>
                <span className="ml-1 text-sm text-muted">days</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total days"
              value={result.totalDays.toLocaleString()}
            />
            <StatCard
              label="Total hours"
              value={result.totalHours.toLocaleString()}
            />
            <StatCard
              label="Born on"
              value={result.dayOfWeek}
            />
            <StatCard
              label="Zodiac sign"
              value={result.zodiac}
            />
            <StatCard
              label="Next birthday"
              value={result.daysUntilNextBirthday === 0 ? "Today!" : `${result.daysUntilNextBirthday}`}
              sub={result.daysUntilNextBirthday === 0 ? undefined : "days away"}
            />
            <StatCard
              label="Heartbeats"
              value={`~${(result.totalDays * 100_800).toLocaleString()}`}
              sub="at 70 bpm"
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center rounded-md border border-border bg-surface p-12">
          <p className="text-muted">
            {birthDateStr ? "Please select a date in the past" : "Enter your date of birth to calculate your age"}
          </p>
        </div>
      )}
    </div>
  );
}
