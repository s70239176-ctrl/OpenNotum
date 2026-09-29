import { CheckCircle2, XCircle, HelpCircle, CircleSlash } from "lucide-react";
import { VERDICT_LABEL, VERDICT_TONE } from "@/lib/cases";

const TONE_STYLES: Record<string, { classes: string; Icon: typeof CheckCircle2 }> = {
  positive: { classes: "bg-success-bg text-success border-success-border", Icon: CheckCircle2 },
  negative: { classes: "bg-danger-bg text-danger border-danger-border", Icon: XCircle },
  neutral: { classes: "bg-neutral-bg text-ink-secondary border-neutral-border", Icon: CircleSlash },
  pending: { classes: "bg-warn-bg text-warn border-warn-border", Icon: HelpCircle },
};

export function VerdictBadge({ verdict, size = "md" }: { verdict: string; size?: "sm" | "md" | "lg" }) {
  const tone = VERDICT_TONE[verdict] ?? "neutral";
  const label = VERDICT_LABEL[verdict] ?? verdict;
  const { classes, Icon } = TONE_STYLES[tone];
  const sizeClasses =
    size === "lg"
      ? "px-4 py-2 text-base gap-2"
      : size === "sm"
        ? "px-2.5 py-0.5 text-xs gap-1"
        : "px-3 py-1 text-sm gap-1.5";
  const iconSize = size === "lg" ? 20 : size === "sm" ? 13 : 15;

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${classes} ${sizeClasses}`}>
      <Icon size={iconSize} strokeWidth={2} />
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line-strong px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
      {status}
    </span>
  );
}
