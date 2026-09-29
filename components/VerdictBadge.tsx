import { VERDICT_LABEL, VERDICT_TONE } from "@/lib/cases";

const TONE_CLASSES: Record<string, string> = {
  confirmed: "bg-confirmed/10 text-confirmed border-confirmed/30",
  changed: "bg-changed/10 text-changed border-changed/30",
  gone: "bg-gone/10 text-gone border-gone/30",
  insufficient: "bg-insufficient/10 text-insufficient border-insufficient/30",
};

export function VerdictBadge({ verdict }: { verdict: string }) {
  const tone = VERDICT_TONE[verdict] ?? "insufficient";
  const label = VERDICT_LABEL[verdict] ?? verdict;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line-strong px-2.5 py-0.5 text-xs uppercase tracking-wide text-ink-muted">
      {status}
    </span>
  );
}
