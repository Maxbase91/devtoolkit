"use client";

import { useState, useMemo } from "react";

interface CardState {
  a: string;
  b: string;
}

function formatResult(value: number): string {
  if (!isFinite(value)) return "—";
  return parseFloat(value.toFixed(10)).toString();
}

interface CalcCardProps {
  title: string;
  labelA: string;
  labelB: string;
  state: CardState;
  onChange: (field: "a" | "b", value: string) => void;
  result: string;
  formula: string;
  resultColor?: string;
}

function CalcCard({
  title,
  labelA,
  labelB,
  state,
  onChange,
  result,
  formula,
  resultColor,
}: CalcCardProps) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">{labelA}</label>
          <input
            type="number"
            value={state.a}
            onChange={(e) => onChange("a", e.target.value)}
            placeholder="0"
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">{labelB}</label>
          <input
            type="number"
            value={state.b}
            onChange={(e) => onChange("b", e.target.value)}
            placeholder="0"
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-sm bg-background p-3">
        <p className="text-xs text-muted">Result</p>
        <p className={`mt-1 text-xl font-semibold ${resultColor ?? "text-foreground"}`}>
          {result}
        </p>
      </div>

      {formula && (
        <p className="mt-2 text-xs text-muted">{formula}</p>
      )}
    </div>
  );
}

export default function PercentageCalc() {
  const [card1, setCard1] = useState<CardState>({ a: "", b: "" });
  const [card2, setCard2] = useState<CardState>({ a: "", b: "" });
  const [card3, setCard3] = useState<CardState>({ a: "", b: "" });

  const updateCard =
    (setter: React.Dispatch<React.SetStateAction<CardState>>) =>
    (field: "a" | "b", value: string) => {
      setter((prev) => ({ ...prev, [field]: value }));
    };

  const result1 = useMemo(() => {
    const x = parseFloat(card1.a);
    const y = parseFloat(card1.b);
    if (isNaN(x) || isNaN(y)) return { value: "—", formula: "" };
    const res = (x / 100) * y;
    return {
      value: formatResult(res),
      formula: `${x}% x ${y} = ${formatResult(res)}`,
    };
  }, [card1.a, card1.b]);

  const result2 = useMemo(() => {
    const x = parseFloat(card2.a);
    const y = parseFloat(card2.b);
    if (isNaN(x) || isNaN(y) || y === 0) return { value: "—", formula: "" };
    const res = (x / y) * 100;
    return {
      value: `${formatResult(res)}%`,
      formula: `(${x} / ${y}) x 100 = ${formatResult(res)}%`,
    };
  }, [card2.a, card2.b]);

  const result3 = useMemo(() => {
    const x = parseFloat(card3.a);
    const y = parseFloat(card3.b);
    if (isNaN(x) || isNaN(y) || x === 0) return { value: "—", formula: "", direction: "" };
    const change = ((y - x) / Math.abs(x)) * 100;
    const direction = change > 0 ? "increase" : change < 0 ? "decrease" : "no change";
    return {
      value: `${formatResult(Math.abs(change))}%`,
      formula: `((${y} - ${x}) / |${x}|) x 100 = ${formatResult(change)}%`,
      direction,
    };
  }, [card3.a, card3.b]);

  const card3Color =
    result3.direction === "increase"
      ? "text-success"
      : result3.direction === "decrease"
        ? "text-error"
        : "text-foreground";

  const card3Display =
    result3.value === "—"
      ? "—"
      : result3.direction === "increase"
        ? `+${result3.value}`
        : result3.direction === "decrease"
          ? `-${result3.value}`
          : result3.value;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <CalcCard
        title="What is X% of Y?"
        labelA="Percentage (X)"
        labelB="Number (Y)"
        state={card1}
        onChange={updateCard(setCard1)}
        result={result1.value}
        formula={result1.formula}
      />

      <CalcCard
        title="X is what % of Y?"
        labelA="Value (X)"
        labelB="Total (Y)"
        state={card2}
        onChange={updateCard(setCard2)}
        result={result2.value}
        formula={result2.formula}
      />

      <CalcCard
        title="% change from X to Y"
        labelA="From (X)"
        labelB="To (Y)"
        state={card3}
        onChange={updateCard(setCard3)}
        result={card3Display}
        formula={result3.formula}
        resultColor={card3Color}
      />
    </div>
  );
}
