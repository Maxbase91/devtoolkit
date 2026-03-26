"use client";

export default function ToolPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-border bg-surface p-12">
      <p className="text-muted">
        {name} — coming soon
      </p>
    </div>
  );
}
