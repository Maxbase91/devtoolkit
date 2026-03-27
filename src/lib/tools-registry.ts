import type { Category } from "./constants";
import type { ComponentType } from "react";

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: Category;
  icon: string;
  tags: string[];
  hasAI?: boolean;
  metaTitle: string;
  metaDescription: string;
}

export const tools: ToolDefinition[] = [
  // --- TEXT TOOLS ---
  {
    slug: "word-counter",
    name: "Word & Character Counter",
    description:
      "Count words, characters, sentences, and estimate reading time.",
    longDescription:
      "Paste any text to instantly count words, characters (with and without spaces), sentences, paragraphs, and get an estimated reading time. Useful for writers, students, and content creators who need to hit word count targets.",
    category: "text",
    icon: "type",
    tags: [
      "word count",
      "character count",
      "reading time",
      "letter count",
      "text analysis",
    ],
    metaTitle: "Free Online Word & Character Counter",
    metaDescription:
      "Count words, characters, sentences, and paragraphs instantly. Estimate reading time. Free, private, runs in your browser.",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description:
      "Convert text between UPPER, lower, Title, camelCase, snake_case, and more.",
    longDescription:
      "Transform text between multiple case formats instantly. Supports uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. Essential for developers and writers.",
    category: "text",
    icon: "a-large-small",
    tags: [
      "uppercase",
      "lowercase",
      "title case",
      "camelCase",
      "snake_case",
      "kebab-case",
      "PascalCase",
      "text transform",
    ],
    metaTitle: "Free Text Case Converter — camelCase, snake_case, Title Case",
    metaDescription:
      "Convert text between uppercase, lowercase, camelCase, snake_case, kebab-case, PascalCase, and more. Free and private.",
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description:
      "Generate placeholder text by paragraphs, sentences, or words.",
    longDescription:
      "Generate Lorem Ipsum placeholder text in configurable amounts — by paragraph, sentence, or word count. Copy with one click. Useful for designers, developers, and anyone building layouts or mockups.",
    category: "text",
    icon: "text",
    tags: [
      "lorem ipsum",
      "placeholder text",
      "dummy text",
      "filler text",
      "mockup",
    ],
    metaTitle: "Free Lorem Ipsum Generator",
    metaDescription:
      "Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. One-click copy. Free and runs in your browser.",
  },
  {
    slug: "text-diff",
    name: "Text Diff Checker",
    description:
      "Compare two texts side-by-side and highlight differences.",
    longDescription:
      "Paste two blocks of text and instantly see a color-coded diff showing additions, deletions, and changes. Supports character-level and line-level diffing. Great for comparing code, documents, or any text.",
    category: "text",
    icon: "git-compare",
    tags: [
      "diff",
      "compare text",
      "text comparison",
      "difference checker",
      "code diff",
    ],
    hasAI: true,
    metaTitle: "Free Online Text Diff Checker",
    metaDescription:
      "Compare two texts side-by-side with highlighted differences. Character-level and line-level diffing. Free and private.",
  },
  {
    slug: "slug-generator",
    name: "URL Slug Generator",
    description:
      "Convert any title or text into a clean, URL-friendly slug.",
    longDescription:
      "Paste a title, heading, or any text and get a clean URL-friendly slug. Handles special characters, unicode, multiple spaces, and common stop words. Preview the full URL path instantly.",
    category: "text",
    icon: "link",
    tags: [
      "slug",
      "URL",
      "permalink",
      "SEO",
      "url-friendly",
      "slugify",
    ],
    metaTitle: "Free URL Slug Generator",
    metaDescription:
      "Convert any title or text into a clean, URL-friendly slug. Handles special characters and unicode. Free and instant.",
  },

  // --- DEVELOPER TOOLS ---
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    description:
      "Prettify, minify, and validate JSON with syntax highlighting.",
    longDescription:
      "Paste messy or minified JSON and get it beautifully formatted with syntax highlighting. Validates JSON and shows precise error locations. Supports minification, tree view, and path copying.",
    category: "developer",
    icon: "braces",
    tags: [
      "JSON",
      "formatter",
      "prettifier",
      "validator",
      "minify",
      "beautify",
      "syntax highlighting",
    ],
    hasAI: true,
    metaTitle: "Free Online JSON Formatter & Validator",
    metaDescription:
      "Format, validate, and minify JSON with syntax highlighting and error detection. No data sent to servers. Free developer tool.",
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    description:
      "Encode text to Base64 or decode Base64 back to text.",
    longDescription:
      "Encode any text string to Base64 or decode Base64 strings back to readable text. Supports UTF-8. Also handles file-to-Base64 conversion for images and documents, all client-side.",
    category: "developer",
    icon: "binary",
    tags: [
      "base64",
      "encode",
      "decode",
      "binary",
      "data URI",
      "encoding",
    ],
    metaTitle: "Free Base64 Encoder & Decoder",
    metaDescription:
      "Encode and decode Base64 strings instantly. Supports text and files. Runs entirely in your browser. Free developer tool.",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description:
      "Test regular expressions with live matching and explanation.",
    longDescription:
      "Write a regex pattern and test it against sample text with live highlighting of matches. See capture groups, match indices, and a plain-English explanation of what the pattern does.",
    category: "developer",
    icon: "regex",
    tags: [
      "regex",
      "regular expression",
      "pattern matching",
      "regexp",
      "test regex",
    ],
    hasAI: true,
    metaTitle: "Free Online Regex Tester with Explanation",
    metaDescription:
      "Test regex patterns with live matching, capture groups, and plain-English explanations. AI-powered pattern generation. Free.",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description:
      "Convert colors between HEX, RGB, HSL, and HSB with live preview.",
    longDescription:
      "Enter a color in any format — HEX, RGB, HSL, or HSB — and instantly see it converted to all other formats with a live color swatch preview. Includes a color picker and contrast ratio checker.",
    category: "developer",
    icon: "palette",
    tags: [
      "color",
      "HEX",
      "RGB",
      "HSL",
      "color picker",
      "converter",
      "CSS color",
    ],
    metaTitle: "Free Color Converter — HEX, RGB, HSL",
    metaDescription:
      "Convert colors between HEX, RGB, HSL, and HSB with live preview. Check contrast ratios. Free and instant.",
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    description:
      "Convert between Unix timestamps and human-readable dates.",
    longDescription:
      "Convert Unix epoch timestamps to human-readable dates and vice versa. Supports seconds and milliseconds. Includes timezone selector, relative time display, and shows the current Unix timestamp live.",
    category: "developer",
    icon: "clock",
    tags: [
      "unix timestamp",
      "epoch",
      "date converter",
      "time",
      "UTC",
      "timezone",
    ],
    metaTitle: "Free Unix Timestamp Converter",
    metaDescription:
      "Convert Unix timestamps to dates and back. Supports timezones, seconds, and milliseconds. Free developer tool.",
  },

  // --- DATA TOOLS ---
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description:
      "Calculate percentages: X% of Y, percent change, what percent X is of Y.",
    longDescription:
      "Three-in-one percentage calculator. Calculate 'what is X% of Y', 'X is what percent of Y', and 'percentage change from X to Y'. Clean interface with instant results.",
    category: "data",
    icon: "percent",
    tags: [
      "percentage",
      "percent",
      "calculator",
      "math",
      "percent change",
      "markup",
      "discount",
    ],
    metaTitle: "Free Percentage Calculator",
    metaDescription:
      "Calculate percentages three ways: X% of Y, what percent X is of Y, and percent change. Free and instant.",
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description:
      "Convert between units of length, weight, temperature, volume, and speed.",
    longDescription:
      "Universal unit converter covering length, weight/mass, temperature, volume, area, speed, and digital storage. Clean category tabs with instant conversion between all common units.",
    category: "data",
    icon: "ruler",
    tags: [
      "unit converter",
      "length",
      "weight",
      "temperature",
      "volume",
      "metric",
      "imperial",
      "km to miles",
    ],
    metaTitle: "Free Unit Converter — Length, Weight, Temperature, Volume",
    metaDescription:
      "Convert between units of length, weight, temperature, volume, speed, and more. Instant, free, and private.",
  },
  {
    slug: "csv-json-converter",
    name: "CSV ↔ JSON Converter",
    description:
      "Convert between CSV and JSON formats. Paste or upload.",
    longDescription:
      "Convert CSV data to JSON array format and vice versa. Supports pasting text directly or uploading files. Handles headers, custom delimiters, nested objects, and large files. All processing happens in your browser.",
    category: "data",
    icon: "table",
    tags: [
      "CSV",
      "JSON",
      "converter",
      "data format",
      "spreadsheet",
      "tabular data",
    ],
    metaTitle: "Free CSV to JSON Converter (and Back)",
    metaDescription:
      "Convert between CSV and JSON formats instantly. Paste or upload. Handles headers and custom delimiters. Free and private.",
  },
  {
    slug: "number-base-converter",
    name: "Number Base Converter",
    description:
      "Convert numbers between decimal, binary, hexadecimal, and octal.",
    longDescription:
      "Enter a number in any base — decimal, binary, hex, or octal — and see it instantly converted to all other bases. Supports large numbers and shows grouped digits for readability.",
    category: "data",
    icon: "hash",
    tags: [
      "binary",
      "hexadecimal",
      "octal",
      "decimal",
      "number base",
      "radix",
      "converter",
    ],
    metaTitle: "Free Number Base Converter — Binary, Hex, Octal, Decimal",
    metaDescription:
      "Convert numbers between binary, hexadecimal, octal, and decimal instantly. Free developer tool.",
  },

  // --- CRYPTO & SECURITY TOOLS ---
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description:
      "Decode and inspect JWT header, payload, and expiry — no verification needed.",
    longDescription:
      "Paste a JSON Web Token to instantly decode and inspect its header, payload, and claims. Check expiration, issued-at, and custom claims. All decoding happens client-side — your tokens are never sent anywhere.",
    category: "crypto",
    icon: "shield-check",
    tags: [
      "JWT",
      "JSON Web Token",
      "decode",
      "inspect",
      "bearer token",
      "auth",
      "claims",
    ],
    metaTitle: "Free Online JWT Decoder & Inspector",
    metaDescription:
      "Decode and inspect JWT tokens instantly. View header, payload, and expiry claims. Free, private, runs in your browser.",
  },
  {
    slug: "uuid-generator",
    name: "UUID / ULID Generator",
    description:
      "Generate UUID v4, UUID v7, and ULID identifiers in bulk.",
    longDescription:
      "Generate cryptographically random UUID v4 identifiers, time-ordered UUID v7, or ULID identifiers. Supports bulk generation of up to 100 IDs at once with one-click copy.",
    category: "crypto",
    icon: "fingerprint",
    tags: [
      "UUID",
      "ULID",
      "GUID",
      "unique ID",
      "generator",
      "v4",
      "v7",
      "random",
    ],
    metaTitle: "Free UUID & ULID Generator — v4, v7, Bulk",
    metaDescription:
      "Generate UUID v4, UUID v7, and ULID identifiers instantly. Bulk generation supported. Free and private.",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text or files.",
    longDescription:
      "Hash any text or file using MD5, SHA-1, SHA-256, or SHA-512 algorithms. All hashing runs in your browser using the Web Crypto API. Compare hashes to verify file integrity.",
    category: "crypto",
    icon: "hash",
    tags: [
      "hash",
      "MD5",
      "SHA-1",
      "SHA-256",
      "SHA-512",
      "checksum",
      "digest",
      "file hash",
    ],
    metaTitle: "Free Online Hash Generator — MD5, SHA-256, SHA-512",
    metaDescription:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files. All processing in your browser. Free.",
  },

  // --- MORE DEVELOPER TOOLS ---
  {
    slug: "yaml-json-converter",
    name: "YAML ↔ JSON Converter",
    description:
      "Convert between YAML and JSON formats bidirectionally.",
    longDescription:
      "Paste YAML to convert to JSON or paste JSON to convert to YAML. Handles nested structures, arrays, and special types. Validates input and shows clear error messages.",
    category: "data",
    icon: "file-json",
    tags: [
      "YAML",
      "JSON",
      "converter",
      "config",
      "data format",
      "YAML to JSON",
      "JSON to YAML",
    ],
    metaTitle: "Free YAML to JSON Converter (and Back)",
    metaDescription:
      "Convert between YAML and JSON formats instantly. Handles nested structures and validates input. Free and private.",
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    description:
      "Encode and decode URL components and full URLs.",
    longDescription:
      "Encode special characters in URLs using percent-encoding or decode percent-encoded URLs back to readable text. Supports both component encoding and full URL encoding.",
    category: "developer",
    icon: "globe",
    tags: [
      "URL encode",
      "URL decode",
      "percent encoding",
      "encodeURIComponent",
      "URI",
      "query string",
    ],
    metaTitle: "Free URL Encoder & Decoder",
    metaDescription:
      "Encode and decode URLs and URL components instantly. Percent-encoding made easy. Free developer tool.",
  },
  {
    slug: "html-entity-encoder",
    name: "HTML Entity Encoder / Decoder",
    description:
      "Encode and decode HTML entities like &amp;, &lt;, and unicode.",
    longDescription:
      "Convert special characters to HTML entities and back. Handles named entities, numeric entities, and unicode. Essential for web developers working with HTML content.",
    category: "developer",
    icon: "code",
    tags: [
      "HTML entities",
      "encode",
      "decode",
      "escape HTML",
      "special characters",
      "ampersand",
      "XSS",
    ],
    metaTitle: "Free HTML Entity Encoder & Decoder",
    metaDescription:
      "Encode and decode HTML entities instantly. Named, numeric, and unicode support. Free developer tool.",
  },
  {
    slug: "cron-expression-generator",
    name: "Cron Expression Generator",
    description:
      "Build cron expressions visually and see the next scheduled run times.",
    longDescription:
      "Create cron expressions using a visual interface. See a human-readable description of the schedule and preview the next 10 run times. Supports standard 5-field cron syntax.",
    category: "developer",
    icon: "calendar-clock",
    tags: [
      "cron",
      "crontab",
      "scheduler",
      "cron expression",
      "cron job",
      "schedule",
      "recurring",
    ],
    metaTitle: "Free Cron Expression Generator & Explainer",
    metaDescription:
      "Build cron expressions visually. See human-readable descriptions and next run times. Free developer tool.",
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description:
      "Format and beautify SQL queries with dialect support.",
    longDescription:
      "Paste messy SQL and get it beautifully formatted with proper indentation and keyword capitalization. Supports PostgreSQL, MySQL, SQLite, and standard SQL dialects.",
    category: "developer",
    icon: "database",
    tags: [
      "SQL",
      "formatter",
      "beautifier",
      "PostgreSQL",
      "MySQL",
      "query",
      "indent",
    ],
    metaTitle: "Free Online SQL Formatter & Beautifier",
    metaDescription:
      "Format and beautify SQL queries instantly. Supports PostgreSQL, MySQL, SQLite. Free developer tool.",
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    description:
      "Live Markdown editor with GitHub Flavored Markdown preview.",
    longDescription:
      "Write Markdown in a live editor and see it rendered instantly with GitHub Flavored Markdown support. Includes syntax highlighting for code blocks, tables, task lists, and more.",
    category: "text",
    icon: "file-text",
    tags: [
      "Markdown",
      "GFM",
      "preview",
      "editor",
      "render",
      "GitHub Markdown",
      "live preview",
    ],
    metaTitle: "Free Online Markdown Editor & Preview",
    metaDescription:
      "Write and preview Markdown with GitHub Flavored Markdown support. Syntax highlighting included. Free and private.",
  },

  // --- DOCUMENT TOOLS ---
  {
    slug: "pdf-merge",
    name: "Merge PDFs",
    description:
      "Combine multiple PDF files into a single document.",
    longDescription:
      "Upload multiple PDF files and merge them into one document. Reorder files before merging. All processing happens in your browser — your files are never uploaded to any server.",
    category: "document",
    icon: "files",
    tags: [
      "PDF",
      "merge",
      "combine",
      "join",
      "concatenate",
      "PDF merge",
    ],
    metaTitle: "Free Online PDF Merger — Combine PDFs",
    metaDescription:
      "Merge multiple PDF files into one document. Reorder before merging. 100% client-side, no uploads. Free.",
  },
  {
    slug: "pdf-split",
    name: "Split PDF / Extract Pages",
    description:
      "Extract specific pages or split a PDF into a new document.",
    longDescription:
      "Upload a PDF and extract specific pages by range (e.g., 1-3, 5, 8-10). Download the selected pages as a new PDF. All processing runs in your browser.",
    category: "document",
    icon: "scissors",
    tags: [
      "PDF",
      "split",
      "extract pages",
      "page range",
      "PDF split",
      "separate",
    ],
    metaTitle: "Free PDF Splitter — Extract Pages",
    metaDescription:
      "Split PDFs and extract specific pages by range. Download as a new PDF. No uploads, runs in your browser. Free.",
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    description:
      "Extract all text content from a PDF file.",
    longDescription:
      "Upload a PDF and extract all text content page by page. Copy the extracted text or view it organized by page. All extraction happens client-side using Mozilla's PDF.js.",
    category: "document",
    icon: "file-search",
    tags: [
      "PDF",
      "text extraction",
      "PDF to text",
      "PDF to TXT",
      "extract text",
      "OCR",
    ],
    metaTitle: "Free PDF to Text Extractor",
    metaDescription:
      "Extract text from PDF files instantly. Page-by-page extraction. No uploads, runs in your browser. Free.",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    description:
      "Convert JPG, PNG, or WebP images into a PDF document.",
    longDescription:
      "Upload one or more images and convert them into a PDF document. Choose page size, orientation, and margins. Reorder images before converting. All processing is client-side.",
    category: "document",
    icon: "image-plus",
    tags: [
      "image to PDF",
      "JPG to PDF",
      "PNG to PDF",
      "convert",
      "photo to PDF",
      "pictures",
    ],
    metaTitle: "Free Images to PDF Converter — JPG, PNG, WebP",
    metaDescription:
      "Convert images to PDF. Supports JPG, PNG, WebP. Choose page size and orientation. No uploads. Free.",
  },
  {
    slug: "pdf-reorder",
    name: "PDF Page Reorder",
    description:
      "Rearrange, rotate, or delete pages in a PDF.",
    longDescription:
      "Upload a PDF to see visual page thumbnails. Reorder pages, rotate them, or delete unwanted pages. Download the modified PDF. All processing happens in your browser.",
    category: "document",
    icon: "arrow-up-down",
    tags: [
      "PDF",
      "reorder pages",
      "rearrange",
      "rotate",
      "delete pages",
      "organize PDF",
    ],
    metaTitle: "Free PDF Page Reorder — Rearrange & Rotate",
    metaDescription:
      "Reorder, rotate, and delete PDF pages visually. Download the modified PDF. No uploads. Free.",
  },

  // --- UTILITY TOOLS ---
  {
    slug: "password-generator",
    name: "Password Generator",
    description:
      "Generate strong, random passwords with configurable rules.",
    longDescription:
      "Generate cryptographically secure random passwords with configurable length, character types, and exclusion rules. Includes a strength meter and one-click copy.",
    category: "utility",
    icon: "key-round",
    tags: [
      "password",
      "generator",
      "random",
      "secure",
      "strong password",
      "passphrase",
    ],
    metaTitle: "Free Secure Password Generator",
    metaDescription:
      "Generate strong, random passwords with configurable length and character rules. Strength meter included. Runs in your browser.",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description:
      "Generate QR codes from URLs or text. Download as PNG or SVG.",
    longDescription:
      "Paste any URL or text and generate a QR code instantly. Customize size and error correction level. Download as PNG or SVG. All generation happens client-side.",
    category: "utility",
    icon: "qr-code",
    tags: [
      "QR code",
      "barcode",
      "URL",
      "generator",
      "scan",
      "download",
    ],
    metaTitle: "Free QR Code Generator — PNG & SVG",
    metaDescription:
      "Generate QR codes from any URL or text. Download as PNG or SVG. Free, instant, and private.",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description:
      "Compress and resize images in-browser. No upload to any server.",
    longDescription:
      "Compress JPEG, PNG, and WebP images directly in your browser using Canvas API. Adjust quality, resize dimensions, and see file size reduction in real-time. Zero server uploads — true privacy.",
    category: "image",
    icon: "image",
    tags: [
      "image compression",
      "resize image",
      "compress JPEG",
      "compress PNG",
      "reduce file size",
      "optimize image",
    ],
    metaTitle: "Free In-Browser Image Compressor — No Upload",
    metaDescription:
      "Compress and resize images entirely in your browser. No uploads, no server processing. Supports JPEG, PNG, WebP. Free.",
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    description:
      "Resize images to exact dimensions or by percentage.",
    longDescription:
      "Resize any image to exact pixel dimensions, by percentage, or to a maximum width/height while maintaining aspect ratio. Supports JPEG, PNG, and WebP. All processing in your browser.",
    category: "image",
    icon: "maximize",
    tags: [
      "resize image",
      "image dimensions",
      "scale image",
      "shrink image",
      "enlarge",
      "aspect ratio",
    ],
    metaTitle: "Free Online Image Resizer",
    metaDescription:
      "Resize images to exact dimensions or by percentage. Maintain aspect ratio. No uploads, runs in your browser. Free.",
  },
  {
    slug: "image-cropper",
    name: "Image Cropper",
    description:
      "Crop images visually with aspect ratio presets.",
    longDescription:
      "Upload an image and select a crop area visually. Choose from aspect ratio presets like 1:1, 4:3, 16:9, or crop freely. Download the cropped result instantly. All processing is client-side.",
    category: "image",
    icon: "crop",
    tags: [
      "crop image",
      "trim image",
      "cut image",
      "aspect ratio",
      "square crop",
      "photo crop",
    ],
    metaTitle: "Free Online Image Cropper",
    metaDescription:
      "Crop images visually with aspect ratio presets. 1:1, 4:3, 16:9 and free crop. No uploads. Free.",
  },
  {
    slug: "image-converter",
    name: "Image Format Converter",
    description:
      "Convert images between PNG, JPG, and WebP formats.",
    longDescription:
      "Convert images between PNG, JPEG, and WebP formats with adjustable quality. Supports batch conversion of multiple images. See file size comparison before and after.",
    category: "image",
    icon: "repeat",
    tags: [
      "convert image",
      "PNG to JPG",
      "JPG to PNG",
      "WebP converter",
      "image format",
      "batch convert",
    ],
    metaTitle: "Free Image Format Converter — PNG, JPG, WebP",
    metaDescription:
      "Convert images between PNG, JPG, and WebP. Batch support. Quality control. No uploads. Free.",
  },
  {
    slug: "image-watermark",
    name: "Image Watermark",
    description:
      "Add text watermarks to images with custom position and opacity.",
    longDescription:
      "Add customizable text watermarks to your images. Control font size, color, opacity, position, and rotation. Option to tile the watermark across the entire image. All processing client-side.",
    category: "image",
    icon: "stamp",
    tags: [
      "watermark",
      "text overlay",
      "protect image",
      "copyright",
      "brand image",
      "photo watermark",
    ],
    metaTitle: "Free Image Watermark Tool",
    metaDescription:
      "Add text watermarks to images with custom position, opacity, and rotation. No uploads. Free.",
  },
  {
    slug: "image-metadata-stripper",
    name: "Image Metadata Stripper",
    description:
      "Remove EXIF, GPS, and other metadata from images for privacy.",
    longDescription:
      "Strip all metadata from images including EXIF data, GPS coordinates, camera info, and timestamps. Protect your privacy before sharing photos online. Batch processing supported.",
    category: "image",
    icon: "shield-off",
    tags: [
      "EXIF",
      "metadata",
      "GPS",
      "privacy",
      "strip metadata",
      "remove EXIF",
      "photo privacy",
    ],
    metaTitle: "Free Image Metadata Stripper — Remove EXIF & GPS",
    metaDescription:
      "Remove EXIF, GPS, and metadata from images for privacy. Batch support. No uploads. Free.",
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    description:
      "Generate all standard favicon sizes from a single image.",
    longDescription:
      "Upload one image and generate favicons in all standard sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 180x180 (Apple), 192x192 (Android), 512x512 (PWA). Download individually or as ZIP with HTML snippet.",
    category: "image",
    icon: "app-window",
    tags: [
      "favicon",
      "icon generator",
      "app icon",
      "apple touch icon",
      "PWA icon",
      "website icon",
    ],
    metaTitle: "Free Favicon Generator — All Sizes + HTML Snippet",
    metaDescription:
      "Generate favicons in all standard sizes from one image. Download as ZIP with HTML snippet. Free.",
  },
  {
    slug: "countdown-timer",
    name: "Countdown Timer",
    description:
      "Set a target date and get a live countdown. Shareable via URL.",
    longDescription:
      "Create a countdown to any future date and time. Shows days, hours, minutes, and seconds remaining. Generate a shareable URL with the target date encoded.",
    category: "utility",
    icon: "timer",
    tags: [
      "countdown",
      "timer",
      "event",
      "deadline",
      "launch",
      "date",
    ],
    metaTitle: "Free Online Countdown Timer — Shareable",
    metaDescription:
      "Create live countdowns to any date. Share via URL. Shows days, hours, minutes, seconds. Free and instant.",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description:
      "Calculate exact age in years, months, and days from a birthdate.",
    longDescription:
      "Enter a birthdate and get your exact age broken down into years, months, and days. Also shows total days lived, days until next birthday, day of the week you were born, and your zodiac sign.",
    category: "utility",
    icon: "cake",
    tags: [
      "age",
      "birthday",
      "calculator",
      "date",
      "years old",
      "days lived",
    ],
    metaTitle: "Free Age Calculator — Exact Years, Months, Days",
    metaDescription:
      "Calculate your exact age in years, months, and days. See days until next birthday and day of birth. Free and instant.",
  },
  {
    slug: "pomodoro-timer",
    name: "Pomodoro Timer",
    description:
      "25/5 focus timer with session tracking and browser notifications.",
    longDescription:
      "Simple, beautiful Pomodoro timer with configurable work/break durations. Tracks completed sessions. Browser notifications alert you when a session ends.",
    category: "utility",
    icon: "alarm-clock",
    tags: [
      "pomodoro",
      "timer",
      "focus",
      "productivity",
      "work timer",
      "break",
    ],
    metaTitle: "Free Pomodoro Timer — Focus & Productivity",
    metaDescription:
      "Simple Pomodoro timer with session tracking and browser notifications. Configurable work/break durations. Free.",
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: Category): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
