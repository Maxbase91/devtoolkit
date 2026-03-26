"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

type Base = "2" | "8" | "10" | "16";

const baseOptions: { value: Base; label: string }[] = [
  { value: "10", label: "Decimal" },
  { value: "2", label: "Binary" },
  { value: "16", label: "Hexadecimal" },
  { value: "8", label: "Octal" },
];

const validationPatterns: Record<Base, RegExp> = {
  "2": /^[01]*$/,
  "8": /^[0-7]*$/,
  "10": /^[0-9]*$/,
  "16": /^[0-9a-fA-F]*$/,
};

function groupDigits(value: string, groupSize: number): string {
  if (!value) return "";
  const padded =
    value.length % groupSize === 0
      ? value
      : value.padStart(Math.ceil(value.length / groupSize) * groupSize, "0");

  const groups: string[] = [];
  for (let i = 0; i < padded.length; i += groupSize) {
    groups.push(padded.slice(i, i + groupSize));
  }
  return groups.join(" ");
}

function formatOutput(value: string, base: Base): string {
  if (!value) return "";
  switch (base) {
    case "2":
      return groupDigits(value, 4);
    case "16":
      return groupDigits(value.toUpperCase(), 2);
    default:
      return value;
  }
}

interface OutputRowProps {
  label: string;
  prefix: string;
  value: string;
  rawValue: string;
}

function OutputRow({ label, prefix, value, rawValue }: OutputRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
      <div className="flex-1">
        <p className="mb-1 text-xs text-muted">{label}</p>
        <p className="font-mono text-sm text-foreground">
          <span className="text-muted">{prefix}</span>
          {value || "—"}
        </p>
      </div>
      <CopyButton text={rawValue} />
    </div>
  );
}

export default function NumberBaseConverter() {
  const [input, setInput] = useState("");
  const [inputBase, setInputBase] = useState<Base>("10");

  const isValid = useMemo(() => {
    if (!input) return true;
    return validationPatterns[inputBase].test(input);
  }, [input, inputBase]);

  const conversions = useMemo(() => {
    if (!input || !isValid) {
      return { "2": "", "8": "", "10": "", "16": "" };
    }

    const decimal = parseInt(input, parseInt(inputBase));

    if (isNaN(decimal)) {
      return { "2": "", "8": "", "10": "", "16": "" };
    }

    return {
      "2": decimal.toString(2),
      "8": decimal.toString(8),
      "10": decimal.toString(10),
      "16": decimal.toString(16),
    };
  }, [input, inputBase, isValid]);

  function handleInputChange(value: string) {
    setInput(value);
  }

  function handleBaseChange(base: Base) {
    setInputBase(base);
    setInput("");
  }

  return (
    <div className="space-y-5">
      {/* Input section */}
      <div className="rounded-md border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Input Number
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                inputBase === "2"
                  ? "e.g. 10110"
                  : inputBase === "8"
                    ? "e.g. 755"
                    : inputBase === "16"
                      ? "e.g. 1A3F"
                      : "e.g. 255"
              }
              className={`w-full rounded-sm border px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none ${
                !isValid
                  ? "border-error focus:border-error"
                  : "border-border bg-background focus:border-accent"
              }`}
            />
            {!isValid && (
              <p className="mt-1 text-xs text-error">
                Invalid character for{" "}
                {baseOptions.find((b) => b.value === inputBase)?.label} input
              </p>
            )}
          </div>

          <div className="sm:w-48">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Input Base
            </label>
            <select
              value={inputBase}
              onChange={(e) => handleBaseChange(e.target.value as Base)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {baseOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Output grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <OutputRow
          label="Decimal (Base 10)"
          prefix=""
          value={conversions["10"]}
          rawValue={conversions["10"]}
        />
        <OutputRow
          label="Binary (Base 2)"
          prefix="0b"
          value={formatOutput(conversions["2"], "2")}
          rawValue={conversions["2"]}
        />
        <OutputRow
          label="Hexadecimal (Base 16)"
          prefix="0x"
          value={formatOutput(conversions["16"], "16")}
          rawValue={conversions["16"].toUpperCase()}
        />
        <OutputRow
          label="Octal (Base 8)"
          prefix="0o"
          value={conversions["8"]}
          rawValue={conversions["8"]}
        />
      </div>
    </div>
  );
}
