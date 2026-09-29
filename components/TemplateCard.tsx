import { GitBranch, Building2, Activity, ArrowRight } from "lucide-react";

const ICONS = { github_release: GitBranch, company_ir: Building2, status_page: Activity } as const;

export function TemplateCard({
  id,
  label,
  description,
  requiredFields,
}: {
  id: string;
  label: string;
  description: string;
  requiredFields: string[];
}) {
  const Icon = ICONS[id as keyof typeof ICONS] ?? Activity;
  return (
    <div className="group flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-6 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-bg text-ink-secondary">
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <ArrowRight size={16} className="text-ink-muted transition-transform group-hover:translate-x-0.5" />
      </div>
      <h2 className="text-[16px] font-semibold text-ink">{label}</h2>
      <p className="text-[13px] leading-relaxed text-ink-secondary">{description}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {requiredFields.map((f) => (
          <span key={f} className="rounded-full bg-neutral-bg px-2.5 py-0.5 text-[11px] text-ink-muted">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
