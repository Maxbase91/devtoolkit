export const SITE_NAME = "DevToolkit";
export const SITE_DESCRIPTION =
  "Developer tools that respect your privacy. 29 free tools that run entirely in your browser.";
export const SITE_URL = "https://devtoolkit.io";

export const CATEGORIES = {
  text: {
    label: "Text Tools",
    description: "Transform, analyze, and generate text",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  developer: {
    label: "Developer Tools",
    description: "Format, encode, test, and convert code data",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  data: {
    label: "Data Tools",
    description: "Calculate, convert, and transform data",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  crypto: {
    label: "Crypto & Security",
    description: "Hash, encode, decode, and verify",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  utility: {
    label: "Utility Tools",
    description: "Generate, compress, and track",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
} as const;

export type Category = keyof typeof CATEGORIES;
