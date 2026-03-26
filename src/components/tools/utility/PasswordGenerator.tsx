"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

interface CharsetConfig {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  uppercaseNoAmbiguous: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  lowercaseNoAmbiguous: "abcdefghjkmnpqrstuvwxyz",
  numbers: "0123456789",
  numbersNoAmbiguous: "23456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/~",
};

function buildCharset(config: CharsetConfig): string {
  let charset = "";
  if (config.uppercase) {
    charset += config.excludeAmbiguous ? CHARS.uppercaseNoAmbiguous : CHARS.uppercase;
  }
  if (config.lowercase) {
    charset += config.excludeAmbiguous ? CHARS.lowercaseNoAmbiguous : CHARS.lowercase;
  }
  if (config.numbers) {
    charset += config.excludeAmbiguous ? CHARS.numbersNoAmbiguous : CHARS.numbers;
  }
  if (config.symbols) {
    charset += CHARS.symbols;
  }
  return charset;
}

function getRequiredChars(config: CharsetConfig): string[] {
  const required: string[] = [];
  if (config.uppercase) {
    const pool = config.excludeAmbiguous ? CHARS.uppercaseNoAmbiguous : CHARS.uppercase;
    required.push(pool[cryptoRandom(pool.length)]);
  }
  if (config.lowercase) {
    const pool = config.excludeAmbiguous ? CHARS.lowercaseNoAmbiguous : CHARS.lowercase;
    required.push(pool[cryptoRandom(pool.length)]);
  }
  if (config.numbers) {
    const pool = config.excludeAmbiguous ? CHARS.numbersNoAmbiguous : CHARS.numbers;
    required.push(pool[cryptoRandom(pool.length)]);
  }
  if (config.symbols) {
    required.push(CHARS.symbols[cryptoRandom(CHARS.symbols.length)]);
  }
  return required;
}

function cryptoRandom(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function generatePassword(length: number, config: CharsetConfig): string {
  const charset = buildCharset(config);
  if (charset.length === 0) return "";

  const required = getRequiredChars(config);
  const remaining = length - required.length;

  const chars: string[] = [...required];
  for (let i = 0; i < remaining; i++) {
    chars.push(charset[cryptoRandom(charset.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = cryptoRandom(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function calculateEntropy(charsetSize: number, length: number): number {
  if (charsetSize <= 0) return 0;
  return Math.log2(Math.pow(charsetSize, length));
}

function getStrength(entropy: number): { label: string; color: string; percent: number } {
  if (entropy < 40) return { label: "Weak", color: "bg-red-500", percent: 25 };
  if (entropy < 60) return { label: "Fair", color: "bg-orange-500", percent: 50 };
  if (entropy < 80) return { label: "Strong", color: "bg-yellow-500", percent: 75 };
  return { label: "Very Strong", color: "bg-green-500", percent: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [config, setConfig] = useState<CharsetConfig>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");

  const charset = useMemo(() => buildCharset(config), [config]);

  const entropy = useMemo(
    () => calculateEntropy(charset.length, length),
    [charset.length, length]
  );

  const strength = useMemo(() => getStrength(entropy), [entropy]);

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, config));
  }, [length, config]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const toggleOption = (key: keyof CharsetConfig) => {
    if (key === "excludeAmbiguous") {
      setConfig((prev) => ({ ...prev, excludeAmbiguous: !prev.excludeAmbiguous }));
      return;
    }
    // Prevent disabling the last active charset
    const active = [config.uppercase, config.lowercase, config.numbers, config.symbols].filter(Boolean).length;
    if (active <= 1 && config[key]) return;
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const charsetToggles: { key: keyof CharsetConfig; label: string }[] = [
    { key: "uppercase", label: "A-Z" },
    { key: "lowercase", label: "a-z" },
    { key: "numbers", label: "0-9" },
    { key: "symbols", label: "!@#$" },
  ];

  return (
    <div className="space-y-6">
      {/* Password display */}
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <p
            className="min-h-[2rem] flex-1 break-all font-mono text-lg leading-relaxed text-foreground select-all"
          >
            {password || <span className="text-muted">No characters selected</span>}
          </p>
          <CopyButton text={password} />
        </div>
      </div>

      {/* Strength meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Strength</span>
          <span className="font-medium text-foreground">
            {strength.label} ({Math.round(entropy)} bits)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={cn("h-full rounded-full transition-all duration-300", strength.color)}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      {/* Length slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <label className="font-medium text-muted">Length</label>
          <span className="font-mono text-foreground">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={128}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="flex justify-between text-xs text-muted">
          <span>8</span>
          <span>128</span>
        </div>
      </div>

      {/* Character toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted">Characters</label>
        <div className="flex flex-wrap gap-2">
          {charsetToggles.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleOption(key)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                config[key]
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:bg-surface"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => toggleOption("excludeAmbiguous")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            config.excludeAmbiguous
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:bg-surface"
          )}
        >
          Exclude ambiguous (0, O, l, 1, I)
        </button>
      </div>

      {/* Regenerate button */}
      <button
        onClick={regenerate}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Regenerate
      </button>
    </div>
  );
}
