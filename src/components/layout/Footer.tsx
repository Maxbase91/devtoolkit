import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Shield className="h-4 w-4" />
          All processing happens in your browser — no data leaves your device
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <span>&copy; {new Date().getFullYear()} DevToolkit</span>
        </div>
      </div>
    </footer>
  );
}
