"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

type Phase = "work" | "short-break" | "long-break";

const PHASE_LABELS: Record<Phase, string> = {
  work: "Work",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

const PHASE_COLORS: Record<Phase, string> = {
  work: "stroke-accent",
  "short-break": "stroke-green-500",
  "long-break": "stroke-blue-500",
};

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 200);
  } catch {
    // AudioContext not available
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(4);

  const [phase, setPhase] = useState<Phase>("work");
  const [currentSession, setCurrentSession] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expectedRef = useRef<number>(0);

  const totalSeconds = phase === "work"
    ? workDuration * 60
    : phase === "short-break"
      ? shortBreak * 60
      : longBreak * 60;

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  // SVG ring dimensions
  const size = 256;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const advancePhase = useCallback(() => {
    playBeep();
    if (phase === "work") {
      if (currentSession >= sessionsBeforeLong) {
        setPhase("long-break");
        setSecondsLeft(longBreak * 60);
      } else {
        setPhase("short-break");
        setSecondsLeft(shortBreak * 60);
      }
    } else {
      // Break finished, start next work session
      if (phase === "long-break") {
        setCurrentSession(1);
      } else {
        setCurrentSession((prev) => prev + 1);
      }
      setPhase("work");
      setSecondsLeft(workDuration * 60);
    }
    setIsRunning(false);
  }, [phase, currentSession, sessionsBeforeLong, workDuration, shortBreak, longBreak]);

  // Drift-corrected interval
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    expectedRef.current = Date.now() + 1000;

    intervalRef.current = setInterval(() => {
      const drift = Date.now() - expectedRef.current;
      expectedRef.current += 1000;

      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });

      // Correct next tick for drift
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        }, Math.max(1000 - drift, 0));
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Watch for timer reaching zero
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      advancePhase();
    }
  }, [secondsLeft, isRunning, advancePhase]);

  const handleReset = () => {
    setIsRunning(false);
    setPhase("work");
    setCurrentSession(1);
    setSecondsLeft(workDuration * 60);
  };

  // Update seconds when duration settings change (only when not running)
  useEffect(() => {
    if (!isRunning) {
      if (phase === "work") setSecondsLeft(workDuration * 60);
      else if (phase === "short-break") setSecondsLeft(shortBreak * 60);
      else setSecondsLeft(longBreak * 60);
    }
  }, [workDuration, shortBreak, longBreak, phase, isRunning]);

  return (
    <div className="space-y-6">
      {/* Settings row */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Work (min)</label>
          <input
            type="number"
            min={15}
            max={60}
            value={workDuration}
            onChange={(e) => setWorkDuration(Math.max(15, Math.min(60, parseInt(e.target.value) || 15)))}
            disabled={isRunning}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Short break (min)</label>
          <input
            type="number"
            min={1}
            max={15}
            value={shortBreak}
            onChange={(e) => setShortBreak(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
            disabled={isRunning}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Long break (min)</label>
          <input
            type="number"
            min={5}
            max={30}
            value={longBreak}
            onChange={(e) => setLongBreak(Math.max(5, Math.min(30, parseInt(e.target.value) || 5)))}
            disabled={isRunning}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Sessions before long</label>
          <input
            type="number"
            min={2}
            max={8}
            value={sessionsBeforeLong}
            onChange={(e) => setSessionsBeforeLong(Math.max(2, Math.min(8, parseInt(e.target.value) || 4)))}
            disabled={isRunning}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </div>
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center gap-4">
        {/* Phase label */}
        <p className={cn(
          "text-sm font-semibold uppercase tracking-widest",
          phase === "work" ? "text-accent" : phase === "short-break" ? "text-green-500" : "text-blue-500"
        )}>
          {PHASE_LABELS[phase]}
        </p>

        {/* Circular progress ring */}
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              className="stroke-border"
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={cn("transition-[stroke-dashoffset] duration-1000 ease-linear", PHASE_COLORS[phase])}
            />
          </svg>
          {/* Time text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold text-foreground">
              {formatTime(secondsLeft)}
            </span>
            <span className="mt-1 text-sm text-muted">
              Session {currentSession} of {sessionsBeforeLong}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="rounded-md bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            Reset
          </button>
        </div>

        {/* Session dots */}
        <div className="flex gap-2">
          {Array.from({ length: sessionsBeforeLong }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-full transition-colors",
                i < currentSession - 1
                  ? "bg-accent"
                  : i === currentSession - 1 && phase === "work"
                    ? "bg-accent/50"
                    : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
