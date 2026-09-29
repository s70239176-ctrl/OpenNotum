import { Globe, Share2, FileText } from "lucide-react";
import type { Mode } from "@/lib/cases";

const MODES: Array<{ id: Mode; icon: typeof Globe; title: string; description: string; meta: string }> = [
  {
    id: "SNAPSHOT",
    icon: Globe,
    title: "Snapshot",
    description: "Verify a claim on a single URL.",
    meta: "1 URL + 1 claim",
  },
  {
    id: "CONFLICT",
    icon: Share2,
    title: "Conflict",
    description: "Compare multiple sources against one question.",
    meta: "2–3 URLs + 1 question",
  },
  {
    id: "TEMPLATE",
    icon: FileText,
    title: "Template",
    description: "Use a predefined verification recipe.",
    meta: "Predefined checks",
  },
];

export function ModeSelector({ value, onChange }: { value: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Filing mode">
      {MODES.map(({ id, icon: Icon, title, description, meta }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={`flex flex-col items-start gap-2.5 rounded-[20px] border p-5 text-left transition-all ${
              selected
                ? "border-accent bg-accent-bg shadow-sm"
                : "border-line bg-surface hover:border-line-strong"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                selected ? "bg-white text-accent" : "bg-neutral-bg text-ink-secondary"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
            </span>
            <span className="text-[15px] font-semibold text-ink">{title}</span>
            <span className="text-[13px] leading-snug text-ink-secondary">{description}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{meta}</span>
          </button>
        );
      })}
    </div>
  );
}
