import { getTemplates } from "@/lib/cases";
import { isContractConfigured } from "@/lib/genlayer";

const FALLBACK = {
  github_release: {
    label: "GitHub release",
    description: "Checks whether a repository's releases page shows the expected tag.",
    required_fields: ["repo_url", "expected_tag"],
  },
  company_ir: {
    label: "Company investor relations",
    description: "Checks an official IR/news page against a claimed announcement.",
    required_fields: ["ir_url", "claim"],
  },
  status_page: {
    label: "Public status page",
    description: "Checks a public status/ops/airline page against a claimed current status.",
    required_fields: ["status_url", "claim"],
  },
};

export default async function TemplatesPage() {
  const templates = isContractConfigured() ? await getTemplates().catch(() => FALLBACK) : FALLBACK;
  const entries = Object.entries(templates);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink">Templates</h1>
        <p className="mt-1 max-w-2xl text-ink-muted">
          Three built-in templates — no custom, user-defined templates. Each checks a
          narrow, well-defined fact against a known-shape source.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map(([id, def]) => (
          <div key={id} className="rounded-lg border border-line bg-card p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">{def.label}</h2>
            <p className="mt-1 text-sm text-ink-muted">{def.description}</p>
            <div className="mt-3 text-xs uppercase tracking-wide text-ink-faint">Required fields</div>
            <ul className="mt-1 list-inside list-disc text-sm text-ink">
              {def.required_fields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
