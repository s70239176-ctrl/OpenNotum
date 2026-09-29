import Link from "next/link";
import { Link2, Share2, FileText, ChevronRight } from "lucide-react";
import { MODE_LABEL, type CaseRecord } from "@/lib/cases";
import { StatusPill, VerdictBadge } from "@/components/VerdictBadge";
import { timeAgo } from "@/lib/time";

const MODE_ICON = { SNAPSHOT: Link2, CONFLICT: Share2, TEMPLATE: FileText } as const;

export function RecordRow({ record }: { record: CaseRecord }) {
  const Icon = MODE_ICON[record.mode];
  const title = record.claim_or_question || record.template_id || `Case #${record.id}`;

  return (
    <Link
      href={`/cases/${record.id}`}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-bg"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-bg text-ink-secondary">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[12px] text-ink-muted">{MODE_LABEL[record.mode]}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        {record.status === "FINAL" ? <VerdictBadge verdict={record.verdict} size="sm" /> : <StatusPill status={record.status} />}
        <span className="w-16 text-right text-[12px] text-ink-muted">{timeAgo(record.resolved_at || record.created_at)}</span>
      </div>
      <ChevronRight size={16} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
