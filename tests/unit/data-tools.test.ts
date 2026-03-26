import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Percentage Calculator — extracted logic
// ---------------------------------------------------------------------------

function formatResult(value: number): string {
  if (!isFinite(value)) return "—";
  return parseFloat(value.toFixed(10)).toString();
}

function percentOf(x: number, y: number): number {
  return (x / 100) * y;
}

function whatPercent(x: number, y: number): number {
  return (x / y) * 100;
}

function percentChange(from: number, to: number): number {
  return ((to - from) / Math.abs(from)) * 100;
}

describe("Percentage Calculator", () => {
  describe("X% of Y", () => {
    it("calculates 10% of 200 = 20", () => {
      expect(percentOf(10, 200)).toBe(20);
    });

    it("calculates 50% of 80 = 40", () => {
      expect(percentOf(50, 80)).toBe(40);
    });

    it("calculates 100% of 55 = 55", () => {
      expect(percentOf(100, 55)).toBe(55);
    });

    it("calculates 0% of any number = 0", () => {
      expect(percentOf(0, 999)).toBe(0);
    });

    it("handles negative percentage", () => {
      expect(percentOf(-10, 200)).toBe(-20);
    });

    it("handles negative base number", () => {
      expect(percentOf(10, -200)).toBe(-20);
    });
  });

  describe("X is what % of Y", () => {
    it("calculates 25 is 50% of 50", () => {
      expect(whatPercent(25, 50)).toBe(50);
    });

    it("calculates 100 is 100% of 100", () => {
      expect(whatPercent(100, 100)).toBe(100);
    });

    it("calculates 0 is 0% of any number", () => {
      expect(whatPercent(0, 50)).toBe(0);
    });

    it("returns Infinity when dividing by 0", () => {
      // Mirrors the component guard: y === 0 returns "—"
      expect(whatPercent(10, 0)).toBe(Infinity);
    });

    it("handles values greater than the total", () => {
      expect(whatPercent(200, 100)).toBe(200);
    });
  });

  describe("% change from X to Y", () => {
    it("calculates 50% increase from 100 to 150", () => {
      expect(percentChange(100, 150)).toBe(50);
    });

    it("calculates -50% decrease from 100 to 50", () => {
      expect(percentChange(100, 50)).toBe(-50);
    });

    it("calculates 100% increase (doubling)", () => {
      expect(percentChange(50, 100)).toBe(100);
    });

    it("calculates 0% change when values are equal", () => {
      expect(percentChange(42, 42)).toBe(0);
    });

    it("handles negative starting value", () => {
      // from -100 to -50: ((-50 - -100) / |-100|) * 100 = 50%
      expect(percentChange(-100, -50)).toBe(50);
    });

    it("returns Infinity when starting from 0", () => {
      expect(percentChange(0, 100)).toBe(Infinity);
    });
  });

  describe("formatResult", () => {
    it("formats finite numbers", () => {
      expect(formatResult(20)).toBe("20");
    });

    it("returns — for Infinity", () => {
      expect(formatResult(Infinity)).toBe("—");
    });

    it("returns — for NaN", () => {
      expect(formatResult(NaN)).toBe("—");
    });

    it("trims trailing zeros", () => {
      expect(formatResult(1.5)).toBe("1.5");
    });

    it("handles very small decimals", () => {
      expect(formatResult(0.1 + 0.2)).toBe("0.3");
    });
  });
});

// ---------------------------------------------------------------------------
// Unit Converter — extracted logic
// ---------------------------------------------------------------------------

function linear(factor: number) {
  return (v: number) => v * factor;
}

function linearInv(factor: number) {
  return (v: number) => v / factor;
}

interface UnitDef {
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

function unit(factor: number): UnitDef {
  return { toBase: linear(factor), fromBase: linearInv(factor) };
}

const categories = {
  length: {
    m: unit(1),
    km: unit(1000),
    cm: unit(0.01),
    in: unit(0.0254),
    ft: unit(0.3048),
    mi: unit(1609.344),
  },
  weight: {
    kg: unit(1),
    g: unit(0.001),
    lb: unit(0.453592),
    oz: unit(0.0283495),
  },
  temperature: {
    C: { toBase: (v: number) => v, fromBase: (v: number) => v },
    F: {
      toBase: (v: number) => (v - 32) * (5 / 9),
      fromBase: (v: number) => v * (9 / 5) + 32,
    },
    K: {
      toBase: (v: number) => v - 273.15,
      fromBase: (v: number) => v + 273.15,
    },
  },
  digital: {
    B: unit(1),
    KB: unit(1024),
    MB: unit(1024 ** 2),
    GB: unit(1024 ** 3),
    TB: unit(1024 ** 4),
  },
} as const;

function convert(
  value: number,
  from: UnitDef,
  to: UnitDef,
): number {
  const base = from.toBase(value);
  return to.fromBase(base);
}

describe("Unit Converter", () => {
  describe("Length", () => {
    const { km, mi, m, ft, cm } = categories.length;
    const inch = categories.length.in;

    it("converts km to miles", () => {
      const result = convert(1, km, mi);
      expect(result).toBeCloseTo(0.621371, 4);
    });

    it("converts m to ft", () => {
      const result = convert(1, m, ft);
      expect(result).toBeCloseTo(3.28084, 4);
    });

    it("converts cm to inches", () => {
      const result = convert(2.54, cm, inch);
      expect(result).toBeCloseTo(1, 4);
    });
  });

  describe("Weight", () => {
    const { kg, lb, g, oz } = categories.weight;

    it("converts kg to lb", () => {
      const result = convert(1, kg, lb);
      expect(result).toBeCloseTo(2.20462, 4);
    });

    it("converts g to oz", () => {
      const result = convert(28.3495, g, oz);
      expect(result).toBeCloseTo(1, 3);
    });
  });

  describe("Temperature", () => {
    const { C, F, K } = categories.temperature;

    it("converts 0°C to 32°F", () => {
      expect(convert(0, C, F)).toBeCloseTo(32, 5);
    });

    it("converts 100°C to 212°F", () => {
      expect(convert(100, C, F)).toBeCloseTo(212, 5);
    });

    it("converts 0°C to 273.15K", () => {
      expect(convert(0, C, K)).toBeCloseTo(273.15, 5);
    });

    it("converts 32°F to 0°C", () => {
      expect(convert(32, F, C)).toBeCloseTo(0, 5);
    });

    it("converts 273.15K to 0°C", () => {
      expect(convert(273.15, K, C)).toBeCloseTo(0, 5);
    });
  });

  describe("Digital Storage", () => {
    const { MB, GB, TB } = categories.digital;

    it("converts MB to GB", () => {
      expect(convert(1024, MB, GB)).toBeCloseTo(1, 5);
    });

    it("converts GB to TB", () => {
      expect(convert(1024, GB, TB)).toBeCloseTo(1, 5);
    });
  });

  describe("Bidirectional conversion", () => {
    it("converts A to B then B to A and gets original value", () => {
      const { km, mi } = categories.length;
      const original = 42;
      const intermediate = convert(original, km, mi);
      const roundTrip = convert(intermediate, mi, km);
      expect(roundTrip).toBeCloseTo(original, 8);
    });

    it("round-trips temperature conversions", () => {
      const { C, F } = categories.temperature;
      const original = 37;
      const intermediate = convert(original, C, F);
      const roundTrip = convert(intermediate, F, C);
      expect(roundTrip).toBeCloseTo(original, 8);
    });
  });
});

// ---------------------------------------------------------------------------
// Number Base Converter — extracted logic
// ---------------------------------------------------------------------------

const validationPatterns: Record<string, RegExp> = {
  "2": /^[01]*$/,
  "8": /^[0-7]*$/,
  "10": /^[0-9]*$/,
  "16": /^[0-9a-fA-F]*$/,
};

function convertBase(input: string, inputBase: string) {
  if (!input || !validationPatterns[inputBase].test(input)) {
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
}

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

function formatOutput(value: string, base: string): string {
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

describe("Number Base Converter", () => {
  it("converts decimal 255 to binary 11111111", () => {
    const result = convertBase("255", "10");
    expect(result["2"]).toBe("11111111");
  });

  it("converts decimal 255 to hex ff", () => {
    const result = convertBase("255", "10");
    expect(result["16"]).toBe("ff");
  });

  it("converts decimal 255 to octal 377", () => {
    const result = convertBase("255", "10");
    expect(result["8"]).toBe("377");
  });

  it("converts binary 1010 to decimal 10", () => {
    const result = convertBase("1010", "2");
    expect(result["10"]).toBe("10");
  });

  it("converts hex FF to decimal 255", () => {
    const result = convertBase("FF", "16");
    expect(result["10"]).toBe("255");
  });

  it("handles 0 in all bases", () => {
    const result = convertBase("0", "10");
    expect(result["2"]).toBe("0");
    expect(result["8"]).toBe("0");
    expect(result["10"]).toBe("0");
    expect(result["16"]).toBe("0");
  });

  it("returns empty strings for invalid input", () => {
    const result = convertBase("GGG", "10");
    expect(result["2"]).toBe("");
    expect(result["10"]).toBe("");
  });

  it("returns empty strings for empty input", () => {
    const result = convertBase("", "10");
    expect(result["2"]).toBe("");
  });

  describe("formatOutput", () => {
    it("groups binary digits in groups of 4", () => {
      expect(formatOutput("11111111", "2")).toBe("1111 1111");
    });

    it("groups hex digits in groups of 2 and uppercases", () => {
      expect(formatOutput("ff", "16")).toBe("FF");
    });

    it("pads binary to fill groups", () => {
      expect(formatOutput("1010", "2")).toBe("1010");
    });

    it("returns empty string for empty input", () => {
      expect(formatOutput("", "2")).toBe("");
    });

    it("returns value unchanged for decimal", () => {
      expect(formatOutput("255", "10")).toBe("255");
    });
  });

  describe("validation patterns", () => {
    it("validates binary input", () => {
      expect(validationPatterns["2"].test("1010")).toBe(true);
      expect(validationPatterns["2"].test("1234")).toBe(false);
    });

    it("validates octal input", () => {
      expect(validationPatterns["8"].test("0177")).toBe(true);
      expect(validationPatterns["8"].test("89")).toBe(false);
    });

    it("validates hex input", () => {
      expect(validationPatterns["16"].test("1aF")).toBe(true);
      expect(validationPatterns["16"].test("XYZ")).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// CSV/JSON Converter — extracted logic
// ---------------------------------------------------------------------------

function parseCsvRow(row: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  fields.push(current);
  return fields;
}

function parseCsv(input: string, delimiter: string, hasHeader: boolean): string {
  const lines = input.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return "[]";

  const rows = lines.map((line) => parseCsvRow(line, delimiter));

  if (hasHeader) {
    const headers = rows[0];
    const dataRows = rows.slice(1);
    const result = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = row[index]?.trim() ?? "";
      });
      return obj;
    });
    return JSON.stringify(result, null, 2);
  }

  return JSON.stringify(rows, null, 2);
}

function escapeCsvField(field: string, delimiter: string): string {
  const needsQuoting =
    field.includes(delimiter) || field.includes('"') || field.includes("\n");
  if (needsQuoting) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function jsonToCsv(input: string, delimiter: string): string {
  const parsed = JSON.parse(input);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return "";
  }

  if (typeof parsed[0] === "object" && !Array.isArray(parsed[0])) {
    const allKeys = new Set<string>();
    for (const item of parsed) {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    }
    const headers = Array.from(allKeys);

    const headerRow = headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter);
    const dataRows = parsed.map((item: Record<string, unknown>) =>
      headers
        .map((key) => escapeCsvField(String(item[key] ?? ""), delimiter))
        .join(delimiter),
    );

    return [headerRow, ...dataRows].join("\n");
  }

  if (Array.isArray(parsed[0])) {
    return parsed
      .map((row: unknown[]) =>
        row.map((cell) => escapeCsvField(String(cell ?? ""), delimiter)).join(delimiter),
      )
      .join("\n");
  }

  return parsed.map((item: unknown) => String(item)).join("\n");
}

describe("CSV/JSON Converter", () => {
  describe("CSV to JSON", () => {
    it("converts basic CSV with headers to JSON", () => {
      const csv = "name,age,city\nJohn,30,NYC\nJane,25,LA";
      const result = JSON.parse(parseCsv(csv, ",", true));
      expect(result).toEqual([
        { name: "John", age: "30", city: "NYC" },
        { name: "Jane", age: "25", city: "LA" },
      ]);
    });

    it("converts CSV without headers to array of arrays", () => {
      const csv = "a,b,c\n1,2,3";
      const result = JSON.parse(parseCsv(csv, ",", false));
      expect(result).toEqual([
        ["a", "b", "c"],
        ["1", "2", "3"],
      ]);
    });

    it("handles quoted fields with commas", () => {
      const csv = 'name,city\n"Doe, John","New York, NY"';
      const result = JSON.parse(parseCsv(csv, ",", true));
      expect(result).toEqual([{ name: "Doe, John", city: "New York, NY" }]);
    });

    it("handles escaped quotes inside quoted fields", () => {
      const csv = 'name,note\nJohn,"He said ""hello"""';
      const result = JSON.parse(parseCsv(csv, ",", true));
      expect(result).toEqual([{ name: "John", note: 'He said "hello"' }]);
    });

    it("handles semicolon delimiter", () => {
      const csv = "name;age\nJohn;30";
      const result = JSON.parse(parseCsv(csv, ";", true));
      expect(result).toEqual([{ name: "John", age: "30" }]);
    });

    it("handles tab delimiter", () => {
      const csv = "name\tage\nJohn\t30";
      const result = JSON.parse(parseCsv(csv, "\t", true));
      expect(result).toEqual([{ name: "John", age: "30" }]);
    });

    it("returns empty array for empty input", () => {
      expect(parseCsv("", ",", true)).toBe("[]");
    });

    it("returns empty array for whitespace-only input", () => {
      expect(parseCsv("   \n  \n  ", ",", true)).toBe("[]");
    });
  });

  describe("JSON to CSV", () => {
    it("converts JSON array of objects to CSV", () => {
      const json = '[{"name":"John","age":30},{"name":"Jane","age":25}]';
      const result = jsonToCsv(json, ",");
      expect(result).toBe("name,age\nJohn,30\nJane,25");
    });

    it("handles fields that need quoting", () => {
      const json = '[{"name":"Doe, John","city":"NYC"}]';
      const result = jsonToCsv(json, ",");
      const lines = result.split("\n");
      expect(lines[0]).toBe("name,city");
      expect(lines[1]).toBe('"Doe, John",NYC');
    });

    it("uses semicolon delimiter", () => {
      const json = '[{"a":"1","b":"2"}]';
      const result = jsonToCsv(json, ";");
      expect(result).toBe("a;b\n1;2");
    });

    it("returns empty string for empty array", () => {
      expect(jsonToCsv("[]", ",")).toBe("");
    });

    it("returns empty string for non-array JSON", () => {
      expect(jsonToCsv('{"a":1}', ",")).toBe("");
    });

    it("collects all keys across objects with different shapes", () => {
      const json = '[{"a":1},{"a":2,"b":3}]';
      const result = jsonToCsv(json, ",");
      const lines = result.split("\n");
      expect(lines[0]).toBe("a,b");
      expect(lines[1]).toBe("1,");
      expect(lines[2]).toBe("2,3");
    });
  });

  describe("escapeCsvField", () => {
    it("does not quote simple fields", () => {
      expect(escapeCsvField("hello", ",")).toBe("hello");
    });

    it("quotes fields containing the delimiter", () => {
      expect(escapeCsvField("hello,world", ",")).toBe('"hello,world"');
    });

    it("quotes fields containing double quotes and escapes them", () => {
      expect(escapeCsvField('say "hi"', ",")).toBe('"say ""hi"""');
    });

    it("quotes fields containing newlines", () => {
      expect(escapeCsvField("line1\nline2", ",")).toBe('"line1\nline2"');
    });
  });
});
