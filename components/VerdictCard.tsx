import { CheckCircle2, XCircle, HelpCircle, CircleSlash } from "lucide-react";
import { VERDICT_EXPLANATION, VERDICT_LABEL, VERDICT_TONE, type CaseRecord } from "@/lib/cases";

const TONE_STYLES: Record<string, { text: string; bg: string; Icon: typeof CheckCircle2 }> = {
  positive: { text: "text-success", bg: "bg-success-bg", Icon: CheckCircle2 },
  negative: { text: "text-danger", bg: "bg-danger-bg", Icon: XCircle },
  neutral: { text: "text-ink-secondary", bg: "bg-neutral-bg", Icon: CircleSlash },
  pending: { text: "text-warn", bg: "bg-warn-bg", Icon: HelpCircle },
};

export function VerdictCard({ record }: { record: CaseRecord }) {
  const tone = VERDICT_TONE[record.verdict] ?? "neutral";
  const { text, bg, Icon } = TONE_STYLES[tone];
  const label = VERDICT_LABEL[record.verdict] ?? record.verdict;

  return (
    <div className="flex flex-col items-center rounded-[24px] border border-line bg-surface px-6 py-14 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${bg}`}>
        <Icon size={32} className={text} strokeWidth={1.75} />
      </span>
      <p className={`mt-5 text-[28px] font-semibold tracking-tight ${text}`}>{label.toUpperCase()}</p>
      <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-ink-secondary">
        {VERDICT_EXPLANATION[record.verdict] ?? ""}
      </p>
    </div>
  );
}
