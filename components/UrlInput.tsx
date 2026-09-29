"use client";

import { Link2, ArrowRight } from "lucide-react";

export function UrlInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2 rounded-full border border-line bg-surface p-2 pl-5 shadow-xs transition-colors focus-within:border-accent"
    >
      <Link2 size={18} className="shrink-0 text-ink-muted" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a URL or enter a claim…"
        aria-label="URL or claim"
        className="w-full bg-transparent py-2.5 text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
      />
      <button
        type="submit"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-dark px-5 py-2.5 text-[14px] font-medium text-white transition-all hover:-translate-y-px hover:bg-dark-hover"
      >
        Verify
        <ArrowRight size={15} />
      </button>
    </form>
  );
}
