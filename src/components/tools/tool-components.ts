import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Each tool slug maps to a dynamically imported client component.
// All tools start as placeholders — swap in real components as they're built.
const toolComponents: Record<string, ComponentType> = {
  "word-counter": dynamic(() => import("./text/WordCounter")),
  "case-converter": dynamic(() => import("./text/CaseConverter")),
  "lorem-ipsum": dynamic(() => import("./text/LoremIpsum")),
  "text-diff": dynamic(() => import("./text/TextDiff")),
  "slug-generator": dynamic(() => import("./text/SlugGenerator")),
  "json-formatter": dynamic(() => import("./developer/JsonFormatter")),
  base64: dynamic(() => import("./developer/Base64Tool")),
  "regex-tester": dynamic(() => import("./developer/RegexTester")),
  "color-converter": dynamic(() => import("./developer/ColorConverter")),
  "timestamp-converter": dynamic(() => import("./developer/TimestampConverter")),
  "percentage-calculator": dynamic(() => import("./data/PercentageCalc")),
  "unit-converter": dynamic(() => import("./data/UnitConverter")),
  "csv-json-converter": dynamic(() => import("./data/CsvJsonConverter")),
  "number-base-converter": dynamic(() => import("./data/NumberBaseConverter")),
  "jwt-decoder": dynamic(() => import("./crypto/JwtDecoder")),
  "uuid-generator": dynamic(() => import("./crypto/UuidGenerator")),
  "hash-generator": dynamic(() => import("./crypto/HashGenerator")),
  "yaml-json-converter": dynamic(() => import("./data/YamlJsonConverter")),
  "url-encoder-decoder": dynamic(() => import("./developer/UrlEncoderDecoder")),
  "html-entity-encoder": dynamic(() => import("./developer/HtmlEntityEncoder")),
  "cron-expression-generator": dynamic(() => import("./developer/CronExpressionGenerator")),
  "sql-formatter": dynamic(() => import("./developer/SqlFormatter")),
  "markdown-preview": dynamic(() => import("./text/MarkdownPreview")),
  "pdf-merge": dynamic(() => import("./document/PdfMerge")),
  "pdf-split": dynamic(() => import("./document/PdfSplit")),
  "pdf-to-text": dynamic(() => import("./document/PdfToText")),
  "images-to-pdf": dynamic(() => import("./document/ImagesToPdf")),
  "pdf-reorder": dynamic(() => import("./document/PdfReorder")),
  "password-generator": dynamic(() => import("./utility/PasswordGenerator")),
  "qr-code-generator": dynamic(() => import("./utility/QrCodeGenerator")),
  "image-compressor": dynamic(() => import("./utility/ImageCompressor")),
  "image-resizer": dynamic(() => import("./image/ImageResizer")),
  "image-cropper": dynamic(() => import("./image/ImageCropper")),
  "image-converter": dynamic(() => import("./image/ImageFormatConverter")),
  "image-watermark": dynamic(() => import("./image/ImageWatermark")),
  "image-metadata-stripper": dynamic(() => import("./image/ImageMetadataStripper")),
  "favicon-generator": dynamic(() => import("./image/FaviconGenerator")),
  "countdown-timer": dynamic(() => import("./utility/CountdownTimer")),
  "age-calculator": dynamic(() => import("./utility/AgeCalculator")),
  "pomodoro-timer": dynamic(() => import("./utility/PomodoroTimer")),
};

export function getToolComponent(slug: string): ComponentType | null {
  return toolComponents[slug] ?? null;
}
