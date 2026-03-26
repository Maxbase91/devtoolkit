import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Zap, Lock, Code } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "DevToolkit is a collection of free, privacy-first developer tools that run entirely in your browser.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">About DevToolkit</h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            What is DevToolkit?
          </h2>
          <p>
            DevToolkit is a collection of 20+ free online tools designed for
            developers and power users. Every tool runs entirely in your browser
            — no data is ever sent to a server.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Privacy First
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">100% Client-Side</p>
                <p className="mt-1">
                  All processing happens in your browser using JavaScript and
                  Web APIs. Your data never leaves your device.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">No Tracking</p>
                <p className="mt-1">
                  We use minimal analytics to understand which tools are useful.
                  We never track what you type, paste, or generate.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">No Sign-Up</p>
                <p className="mt-1">
                  All tools are free to use without creating an account. No
                  email required, no paywalls.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-4">
              <Code className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">Developer-Focused</p>
                <p className="mt-1">
                  Built by developers, for developers. Clean UI, keyboard
                  shortcuts, and tools that actually work.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            How It Works
          </h2>
          <p>
            When you use a tool on DevToolkit, all computation happens directly
            in your web browser. For example, when you compress an image, the
            image is processed using the HTML5 Canvas API on your device. When
            you format JSON, the parsing and formatting happens in JavaScript
            running on your machine. Nothing is uploaded anywhere.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Advertising
          </h2>
          <p>
            DevToolkit is free and supported by display advertising. We keep ads
            minimal and non-intrusive — they never interfere with the tools
            themselves. No pop-ups, no interstitials, no CAPTCHAs.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link
          href="/"
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          &larr; Back to all tools
        </Link>
      </div>
    </main>
  );
}
