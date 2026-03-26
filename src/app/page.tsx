import Link from "next/link";
import { tools } from "@/lib/tools-registry";
import { CATEGORIES, type Category } from "@/lib/constants";
import * as LucideIcons from "lucide-react";
import { Shield, Zap, Lock, Heart } from "lucide-react";

function getIcon(iconName: string) {
  const formatted =
    iconName
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("") as keyof typeof LucideIcons;
  const Icon = LucideIcons[formatted];
  if (Icon && typeof Icon === "function") {
    return Icon as React.ComponentType<{ className?: string }>;
  }
  return LucideIcons.Wrench;
}

export default function Home() {
  const categories = Object.keys(CATEGORIES) as Category[];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Developer tools that respect
          <br />
          <span className="text-accent">your privacy</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          20+ free tools that run entirely in your browser.
          No uploads. No tracking. No BS.
        </p>
        <p className="mt-6 text-sm text-muted">
          Press{" "}
          <kbd className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs border border-border">
            {"\u2318"}K
          </kbd>{" "}
          to search
        </p>
      </section>

      {/* Categories with tools */}
      {categories.map((category) => {
        const categoryTools = tools.filter((t) => t.category === category);
        const cat = CATEGORIES[category];

        return (
          <section key={category} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <h2 className={`text-xl font-semibold ${cat.color}`}>
                {cat.label}
              </h2>
              <span className="text-sm text-muted">
                {categoryTools.length} tools
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => {
                const Icon = getIcon(tool.icon);
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
                  >
                    <div
                      className={`rounded-md p-2 ${cat.bgColor} ${cat.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium group-hover:text-accent">
                        {tool.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Trust bar */}
      <section className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          100% client-side
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          No data leaves your browser
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          No sign-up required
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Free forever
        </div>
      </section>
    </main>
  );
}
