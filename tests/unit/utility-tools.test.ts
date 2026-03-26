import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Password Generator — extracted logic
// ---------------------------------------------------------------------------

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  uppercaseNoAmbiguous: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  lowercaseNoAmbiguous: "abcdefghjkmnpqrstuvwxyz",
  numbers: "0123456789",
  numbersNoAmbiguous: "23456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?/~",
};

interface CharsetConfig {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

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

function cryptoRandom(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
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

describe("Password Generator", () => {
  describe("buildCharset", () => {
    it("includes uppercase letters when enabled", () => {
      const charset = buildCharset({
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(charset).toBe(CHARS.uppercase);
    });

    it("includes lowercase letters when enabled", () => {
      const charset = buildCharset({
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(charset).toBe(CHARS.lowercase);
    });

    it("includes numbers when enabled", () => {
      const charset = buildCharset({
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(charset).toBe(CHARS.numbers);
    });

    it("includes symbols when enabled", () => {
      const charset = buildCharset({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        excludeAmbiguous: false,
      });
      expect(charset).toBe(CHARS.symbols);
    });

    it("combines all character sets", () => {
      const charset = buildCharset({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
      });
      expect(charset).toBe(
        CHARS.uppercase + CHARS.lowercase + CHARS.numbers + CHARS.symbols,
      );
    });

    it("excludes ambiguous characters when enabled", () => {
      const charset = buildCharset({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        excludeAmbiguous: true,
      });
      expect(charset).not.toContain("O");
      expect(charset).not.toContain("I");
      expect(charset).not.toContain("l");
      expect(charset).not.toContain("0");
      expect(charset).not.toContain("1");
    });

    it("returns empty string when nothing is enabled", () => {
      const charset = buildCharset({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(charset).toBe("");
    });
  });

  describe("generatePassword", () => {
    const allConfig: CharsetConfig = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false,
    };

    it("generates password of correct length", () => {
      const password = generatePassword(16, allConfig);
      expect(password).toHaveLength(16);
    });

    it("generates password of minimum length", () => {
      const password = generatePassword(8, allConfig);
      expect(password).toHaveLength(8);
    });

    it("generates password of maximum length", () => {
      const password = generatePassword(128, allConfig);
      expect(password).toHaveLength(128);
    });

    it("returns empty string when charset is empty", () => {
      const password = generatePassword(16, {
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      });
      expect(password).toBe("");
    });

    it("contains only uppercase chars when only uppercase enabled", () => {
      const config: CharsetConfig = {
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      const password = generatePassword(20, config);
      expect(password).toMatch(/^[A-Z]+$/);
    });

    it("contains only lowercase chars when only lowercase enabled", () => {
      const config: CharsetConfig = {
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        excludeAmbiguous: false,
      };
      const password = generatePassword(20, config);
      expect(password).toMatch(/^[a-z]+$/);
    });

    it("contains only digits when only numbers enabled", () => {
      const config: CharsetConfig = {
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
      };
      const password = generatePassword(20, config);
      expect(password).toMatch(/^[0-9]+$/);
    });

    it("contains only symbols when only symbols enabled", () => {
      const config: CharsetConfig = {
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        excludeAmbiguous: false,
      };
      const password = generatePassword(20, config);
      const symbolChars = new Set(CHARS.symbols.split(""));
      for (const ch of password) {
        expect(symbolChars.has(ch)).toBe(true);
      }
    });

    it("contains at least one char from each enabled set", () => {
      const password = generatePassword(16, allConfig);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      // Check for at least one symbol
      const hasSymbol = password.split("").some((ch) => CHARS.symbols.includes(ch));
      expect(hasSymbol).toBe(true);
    });
  });

  describe("calculateEntropy", () => {
    it("returns 0 for empty charset", () => {
      expect(calculateEntropy(0, 16)).toBe(0);
    });

    it("calculates entropy correctly for known values", () => {
      // 26 lowercase letters, 8 chars: log2(26^8) ≈ 37.6
      const entropy = calculateEntropy(26, 8);
      expect(entropy).toBeCloseTo(37.6, 0);
    });

    it("calculates entropy for full charset", () => {
      // 95 printable ASCII, 16 chars: log2(95^16) ≈ 105.1
      const entropy = calculateEntropy(95, 16);
      expect(entropy).toBeCloseTo(105.1, 0);
    });

    it("entropy increases with length", () => {
      const short = calculateEntropy(62, 8);
      const long = calculateEntropy(62, 16);
      expect(long).toBeGreaterThan(short);
      expect(long).toBeCloseTo(short * 2, 5);
    });

    it("entropy increases with charset size", () => {
      const small = calculateEntropy(26, 16);
      const large = calculateEntropy(62, 16);
      expect(large).toBeGreaterThan(small);
    });
  });

  describe("getStrength", () => {
    it("returns Weak for entropy < 40", () => {
      expect(getStrength(30).label).toBe("Weak");
      expect(getStrength(30).percent).toBe(25);
    });

    it("returns Fair for entropy 40-59", () => {
      expect(getStrength(50).label).toBe("Fair");
      expect(getStrength(50).percent).toBe(50);
    });

    it("returns Strong for entropy 60-79", () => {
      expect(getStrength(70).label).toBe("Strong");
      expect(getStrength(70).percent).toBe(75);
    });

    it("returns Very Strong for entropy >= 80", () => {
      expect(getStrength(100).label).toBe("Very Strong");
      expect(getStrength(100).percent).toBe(100);
    });

    it("returns Weak at boundary 39", () => {
      expect(getStrength(39).label).toBe("Weak");
    });

    it("returns Fair at boundary 40", () => {
      expect(getStrength(40).label).toBe("Fair");
    });

    it("returns Strong at boundary 60", () => {
      expect(getStrength(60).label).toBe("Strong");
    });

    it("returns Very Strong at boundary 80", () => {
      expect(getStrength(80).label).toBe("Very Strong");
    });
  });
});

// ---------------------------------------------------------------------------
// Age Calculator — extracted logic
// ---------------------------------------------------------------------------

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

  let nextBirthday = new Date(now.getFullYear(), birthMonth, birthDay);
  if (nextBirthday.getTime() <= now.getTime()) {
    nextBirthday = new Date(now.getFullYear() + 1, birthMonth, birthDay);
  }
  const daysUntilNextBirthday = Math.ceil(
    (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
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

describe("Age Calculator", () => {
  describe("getZodiacSign", () => {
    it("returns Aries for March 21", () => {
      expect(getZodiacSign(3, 21)).toBe("Aries");
    });

    it("returns Aries for April 19", () => {
      expect(getZodiacSign(4, 19)).toBe("Aries");
    });

    it("returns Taurus for April 20", () => {
      expect(getZodiacSign(4, 20)).toBe("Taurus");
    });

    it("returns Capricorn for December 25", () => {
      expect(getZodiacSign(12, 25)).toBe("Capricorn");
    });

    it("returns Capricorn for January 15", () => {
      expect(getZodiacSign(1, 15)).toBe("Capricorn");
    });

    it("returns Aquarius for January 20", () => {
      expect(getZodiacSign(1, 20)).toBe("Aquarius");
    });

    it("returns Leo for August 15", () => {
      expect(getZodiacSign(8, 15)).toBe("Leo");
    });

    it("returns Scorpio for November 1", () => {
      expect(getZodiacSign(11, 1)).toBe("Scorpio");
    });

    it("returns Pisces for March 1", () => {
      expect(getZodiacSign(3, 1)).toBe("Pisces");
    });

    it("returns Cancer for July 4", () => {
      expect(getZodiacSign(7, 4)).toBe("Cancer");
    });

    it("returns Virgo for September 10", () => {
      expect(getZodiacSign(9, 10)).toBe("Virgo");
    });

    it("returns Sagittarius for December 1", () => {
      expect(getZodiacSign(12, 1)).toBe("Sagittarius");
    });
  });

  describe("calculateAge", () => {
    it("calculates exact years, months, days", () => {
      const birth = new Date(1990, 0, 15); // Jan 15, 1990
      const now = new Date(2025, 6, 20);   // Jul 20, 2025
      const result = calculateAge(birth, now);
      expect(result.years).toBe(35);
      expect(result.months).toBe(6);
      expect(result.days).toBe(5);
    });

    it("handles birthday not yet reached in current month", () => {
      const birth = new Date(2000, 5, 25); // Jun 25, 2000
      const now = new Date(2025, 5, 10);   // Jun 10, 2025
      const result = calculateAge(birth, now);
      expect(result.years).toBe(24);
      expect(result.months).toBe(11);
    });

    it("calculates total days", () => {
      const birth = new Date(2024, 0, 1); // Jan 1, 2024
      const now = new Date(2024, 0, 31);  // Jan 31, 2024
      const result = calculateAge(birth, now);
      expect(result.totalDays).toBe(30);
    });

    it("calculates total hours", () => {
      const birth = new Date(2024, 0, 1);
      const now = new Date(2024, 0, 2);
      const result = calculateAge(birth, now);
      expect(result.totalHours).toBe(24);
    });

    it("returns correct day of week", () => {
      // Jan 1, 2024 was a Monday
      const birth = new Date(2024, 0, 1);
      const now = new Date(2025, 0, 1);
      const result = calculateAge(birth, now);
      expect(result.dayOfWeek).toBe("Monday");
    });

    it("returns correct zodiac sign", () => {
      const birth = new Date(1990, 2, 25); // March 25 => Aries
      const now = new Date(2025, 0, 1);
      const result = calculateAge(birth, now);
      expect(result.zodiac).toBe("Aries");
    });
  });

  describe("days until next birthday", () => {
    it("calculates days until upcoming birthday", () => {
      const birth = new Date(1990, 11, 25); // Dec 25
      const now = new Date(2025, 0, 1);     // Jan 1, 2025
      const result = calculateAge(birth, now);
      // Dec 25 is ~359 days from Jan 1
      expect(result.daysUntilNextBirthday).toBeGreaterThan(350);
      expect(result.daysUntilNextBirthday).toBeLessThanOrEqual(365);
    });

    it("returns days for birthday later in the year", () => {
      const birth = new Date(1990, 5, 15); // Jun 15
      const now = new Date(2025, 0, 1);    // Jan 1, 2025
      const result = calculateAge(birth, now);
      // Jun 15 is ~165 days from Jan 1
      expect(result.daysUntilNextBirthday).toBeGreaterThan(160);
      expect(result.daysUntilNextBirthday).toBeLessThan(170);
    });

    it("wraps to next year when birthday has passed", () => {
      const birth = new Date(1990, 0, 1); // Jan 1
      const now = new Date(2025, 0, 2);   // Jan 2, 2025
      const result = calculateAge(birth, now);
      // Next birthday is Jan 1, 2026 — ~364 days away
      expect(result.daysUntilNextBirthday).toBeGreaterThan(360);
    });
  });
});
