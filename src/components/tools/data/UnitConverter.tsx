"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";

type CategoryKey = "length" | "weight" | "temperature" | "volume" | "area" | "speed" | "digital";

interface UnitDef {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

function linear(factor: number): UnitDef["toBase"] {
  return (v) => v * factor;
}

function linearInv(factor: number): UnitDef["fromBase"] {
  return (v) => v / factor;
}

function unit(label: string, factor: number): UnitDef {
  return { label, toBase: linear(factor), fromBase: linearInv(factor) };
}

const categories: Record<CategoryKey, { label: string; units: Record<string, UnitDef> }> = {
  length: {
    label: "Length",
    units: {
      mm: unit("Millimeter (mm)", 0.001),
      cm: unit("Centimeter (cm)", 0.01),
      m: unit("Meter (m)", 1),
      km: unit("Kilometer (km)", 1000),
      in: unit("Inch (in)", 0.0254),
      ft: unit("Foot (ft)", 0.3048),
      yd: unit("Yard (yd)", 0.9144),
      mi: unit("Mile (mi)", 1609.344),
    },
  },
  weight: {
    label: "Weight",
    units: {
      mg: unit("Milligram (mg)", 0.000001),
      g: unit("Gram (g)", 0.001),
      kg: unit("Kilogram (kg)", 1),
      oz: unit("Ounce (oz)", 0.0283495),
      lb: unit("Pound (lb)", 0.453592),
      ton: unit("Metric Ton (ton)", 1000),
    },
  },
  temperature: {
    label: "Temperature",
    units: {
      C: {
        label: "Celsius (\u00B0C)",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      F: {
        label: "Fahrenheit (\u00B0F)",
        toBase: (v) => (v - 32) * (5 / 9),
        fromBase: (v) => v * (9 / 5) + 32,
      },
      K: {
        label: "Kelvin (K)",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    },
  },
  volume: {
    label: "Volume",
    units: {
      ml: unit("Milliliter (ml)", 0.001),
      l: unit("Liter (l)", 1),
      gal: unit("Gallon (gal)", 3.78541),
      cup: unit("Cup", 0.236588),
      floz: unit("Fluid Ounce (fl oz)", 0.0295735),
    },
  },
  area: {
    label: "Area",
    units: {
      mm2: unit("mm\u00B2", 0.000001),
      cm2: unit("cm\u00B2", 0.0001),
      m2: unit("m\u00B2", 1),
      km2: unit("km\u00B2", 1_000_000),
      in2: unit("in\u00B2", 0.00064516),
      ft2: unit("ft\u00B2", 0.092903),
      acre: unit("Acre", 4046.86),
      hectare: unit("Hectare", 10_000),
    },
  },
  speed: {
    label: "Speed",
    units: {
      ms: unit("m/s", 1),
      kmh: unit("km/h", 1 / 3.6),
      mph: unit("mph", 0.44704),
      knots: unit("Knots", 0.514444),
    },
  },
  digital: {
    label: "Digital Storage",
    units: {
      B: unit("Byte (B)", 1),
      KB: unit("Kilobyte (KB)", 1024),
      MB: unit("Megabyte (MB)", 1024 ** 2),
      GB: unit("Gigabyte (GB)", 1024 ** 3),
      TB: unit("Terabyte (TB)", 1024 ** 4),
      PB: unit("Petabyte (PB)", 1024 ** 5),
    },
  },
};

const categoryKeys = Object.keys(categories) as CategoryKey[];

export default function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("length");
  const [leftValue, setLeftValue] = useState("");
  const [leftUnit, setLeftUnit] = useState("");
  const [rightUnit, setRightUnit] = useState("");
  const [activeField, setActiveField] = useState<"left" | "right">("left");
  const [rightValue, setRightValue] = useState("");

  const cat = categories[activeCategory];
  const unitKeys = Object.keys(cat.units);

  const effectiveLeftUnit = unitKeys.includes(leftUnit) ? leftUnit : unitKeys[0];
  const effectiveRightUnit = unitKeys.includes(rightUnit) ? rightUnit : unitKeys[1] ?? unitKeys[0];

  const convert = useMemo(() => {
    const sourceValue = activeField === "left" ? leftValue : rightValue;
    const fromUnit = activeField === "left" ? effectiveLeftUnit : effectiveRightUnit;
    const toUnit = activeField === "left" ? effectiveRightUnit : effectiveLeftUnit;

    const num = parseFloat(sourceValue);
    if (isNaN(num) || !sourceValue.trim()) return "";

    const baseValue = cat.units[fromUnit].toBase(num);
    const result = cat.units[toUnit].fromBase(baseValue);

    return parseFloat(result.toPrecision(12)).toString();
  }, [leftValue, rightValue, effectiveLeftUnit, effectiveRightUnit, activeField, cat.units]);

  const displayLeft = activeField === "left" ? leftValue : convert;
  const displayRight = activeField === "right" ? rightValue : convert;

  function handleLeftChange(value: string) {
    setActiveField("left");
    setLeftValue(value);
  }

  function handleRightChange(value: string) {
    setActiveField("right");
    setRightValue(value);
  }

  function handleSwap() {
    const prevLeft = effectiveLeftUnit;
    const prevRight = effectiveRightUnit;
    setLeftUnit(prevRight);
    setRightUnit(prevLeft);
  }

  function handleCategoryChange(key: CategoryKey) {
    setActiveCategory(key);
    const newUnitKeys = Object.keys(categories[key].units);
    setLeftUnit(newUnitKeys[0]);
    setRightUnit(newUnitKeys[1] ?? newUnitKeys[0]);
    setLeftValue("");
    setRightValue("");
    setActiveField("left");
  }

  return (
    <div className="space-y-5">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categoryKeys.map((key) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === key
                ? "bg-accent text-background"
                : "border border-border text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            {categories[key].label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="rounded-md border border-border bg-surface p-5">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          {/* Left side */}
          <div className="flex w-full flex-1 flex-col gap-2">
            <select
              value={effectiveLeftUnit}
              onChange={(e) => setLeftUnit(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {unitKeys.map((key) => (
                <option key={key} value={key}>
                  {cat.units[key].label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={displayLeft}
              onChange={(e) => handleLeftChange(e.target.value)}
              onFocus={() => setActiveField("left")}
              placeholder="0"
              className="w-full rounded-sm border border-border bg-background px-3 py-3 text-lg font-medium text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-background hover:text-foreground"
            title="Swap units"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* Right side */}
          <div className="flex w-full flex-1 flex-col gap-2">
            <select
              value={effectiveRightUnit}
              onChange={(e) => setRightUnit(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {unitKeys.map((key) => (
                <option key={key} value={key}>
                  {cat.units[key].label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={displayRight}
              onChange={(e) => handleRightChange(e.target.value)}
              onFocus={() => setActiveField("right")}
              placeholder="0"
              className="w-full rounded-sm border border-border bg-background px-3 py-3 text-lg font-medium text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
