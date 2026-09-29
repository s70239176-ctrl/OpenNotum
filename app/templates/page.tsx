import { getTemplates } from "@/lib/cases";
import { isContractConfigured } from "@/lib/genlayer";
import { TemplateCard } from "@/components/TemplateCard";

const FALLBACK = {
  github_release: {
    label: "GitHub Release",
    description: "Verify if a release tag exists in a repository.",
    required_fields: ["repo_url", "expected_tag"],
  },
  company_ir: {
    label: "Investor Relations",
    description: "Verify an official announcement on a company's IR page.",
    required_fields: ["ir_url", "claim"],
  },
  status_page: {
    label: "Public Status",
    description: "Verify operational status on a public status page.",
    required_fields: ["status_url", "claim"],
  },
};

export default async function TemplatesPage() {
  const templates = isContractConfigured() ? await getTemplates().catch(() => FALLBACK) : FALLBACK;
  const entries = Object.entries(templates);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">Verification Templates</h1>
        <p className="mt-1.5 text-[15px] text-ink-secondary">Use a predefined recipe for common verification needs.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {entries.map(([id, def]) => (
          <TemplateCard key={id} id={id} label={def.label} description={def.description} requiredFields={def.required_fields} />
        ))}
      </div>
    </div>
  );
}
