"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { connectWallet, formatError, isContractConfigured } from "@/lib/genlayer";
import { createCase, getTemplates, SAMPLES, type Mode, type TemplateDef, type TemplateId } from "@/lib/cases";
import { ModeSelector } from "@/components/ModeSelector";

type SubmitState =
  | { phase: "idle" }
  | { phase: "pending" }
  | { phase: "success"; caseId: string; explorerUrl: string }
  | { phase: "error"; message: string };

const FIELD_LABEL: Record<string, string> = {
  repo_url: "Repository URL",
  expected_tag: "Expected tag",
  ir_url: "Investor-relations / news URL",
  claim: "Claim",
  status_url: "Status page URL",
};

const FIELD_PLACEHOLDER: Record<string, string> = {
  repo_url: "https://github.com/owner/repo",
  expected_tag: "v1.2.0",
  ir_url: "https://investors.example.com/news",
  claim: "e.g. The company announced Q3 earnings on this page.",
  status_url: "https://status.example.com",
};

function describeTemplateClaim(templateId: TemplateId | "", fields: Record<string, string>): string {
  if (templateId === "github_release") {
    return `Expect tag ${fields.expected_tag ?? ""} on ${fields.repo_url ?? ""}`.slice(0, 500);
  }
  if (templateId === "company_ir" || templateId === "status_page") {
    return (fields.claim ?? "").slice(0, 500);
  }
  return "";
}

export function CaseForm({ initialUrl = "", initialClaim = "" }: { initialUrl?: string; initialClaim?: string }) {
  const router = useRouter();
  const formId = useId();
  const [mode, setMode] = useState<Mode>("SNAPSHOT");
  const [claimOrQuestion, setClaimOrQuestion] = useState(initialClaim);
  const [urls, setUrls] = useState<string[]>([initialUrl]);
  const [templateId, setTemplateId] = useState<TemplateId | "">("");
  const [templateFields, setTemplateFields] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Record<TemplateId, TemplateDef> | null>(null);
  const [state, setState] = useState<SubmitState>({ phase: "idle" });

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch(() => setTemplates(null));
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setClaimOrQuestion("");
    setUrls(next === "CONFLICT" ? ["", ""] : [""]);
    setTemplateId("");
    setTemplateFields({});
    setState({ phase: "idle" });
  }

  function applySample() {
    const sample = SAMPLES[mode];
    setClaimOrQuestion(sample.claimOrQuestion);
    setUrls(sample.urls.length ? sample.urls : [""]);
  }

  function urlCount(): number {
    return mode === "SNAPSHOT" ? 1 : mode === "CONFLICT" ? urls.length : 0;
  }

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function addConflictUrl() {
    setUrls((prev) => (prev.length < 3 ? [...prev, ""] : prev));
  }

  function removeConflictUrl(index: number) {
    setUrls((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
  }

  const selectedTemplate = templateId && templates ? templates[templateId] : null;

  const validUrls = urls.map((u) => u.trim()).filter(Boolean);
  const isValid =
    mode === "TEMPLATE"
      ? Boolean(templateId) &&
        (selectedTemplate?.required_fields ?? []).every((f) => (templateFields[f] ?? "").trim())
      : claimOrQuestion.trim().length > 0 &&
        claimOrQuestion.length <= 500 &&
        validUrls.length === urlCount() &&
        validUrls.every((u) => u.startsWith("https://")) &&
        new Set(validUrls.map((u) => u.toLowerCase())).size === validUrls.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || state.phase === "pending") return;
    setState({ phase: "pending" });
    try {
      const { client } = await connectWallet();
      const result = await createCase(client, {
        mode,
        claimOrQuestion: mode === "TEMPLATE" ? describeTemplateClaim(templateId, templateFields) : claimOrQuestion,
        urls: mode === "TEMPLATE" ? [] : validUrls,
        templateId: mode === "TEMPLATE" ? templateId : "",
        templateFields: mode === "TEMPLATE" ? templateFields : {},
      });
      setState({ phase: "success", caseId: result.caseId, explorerUrl: result.explorerUrl });
    } catch (err) {
      setState({ phase: "error", message: formatError(err) });
    }
  }

  if (!isContractConfigured()) {
    return (
      <div className="rounded-[20px] border border-line bg-surface p-6 text-[14px] text-ink-secondary">
        The contract address is not configured yet
        (<code className="text-ink">NEXT_PUBLIC_CONTRACT_ADDRESS</code>). Filing is disabled until
        deployment is complete.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModeSelector value={mode} onChange={switchMode} />

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[20px] border border-line bg-surface p-6 shadow-xs">
        {mode !== "TEMPLATE" && (
          <>
            <div>
              <label htmlFor={`${formId}-claim`} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {mode === "SNAPSHOT" ? "Claim" : "Question"}
              </label>
              <textarea
                id={`${formId}-claim`}
                value={claimOrQuestion}
                onChange={(e) => setClaimOrQuestion(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
                placeholder={
                  mode === "SNAPSHOT"
                    ? "e.g. Does this page currently state that the product is generally available?"
                    : "e.g. Which source supports the claim?"
                }
              />
              <div className="mt-1 text-right text-[11px] text-ink-muted">{claimOrQuestion.length}/500</div>
            </div>

            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {mode === "SNAPSHOT" ? "Source URL" : "Sources"}
              </div>
              <div className="space-y-2">
                {urls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateUrl(i, e.target.value)}
                      placeholder="https://example.com"
                      aria-label={mode === "CONFLICT" ? `Source ${String.fromCharCode(65 + i)}` : "Source URL"}
                      className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
                    />
                    {mode === "CONFLICT" && urls.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeConflictUrl(i)}
                        aria-label={`Remove source ${i + 1}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-line text-ink-muted hover:text-ink"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {mode === "CONFLICT" && urls.length < 3 && (
                <button
                  type="button"
                  onClick={addConflictUrl}
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                >
                  <Plus size={14} /> Add another source
                </button>
              )}
            </div>
          </>
        )}

        {mode === "TEMPLATE" && (
          <div className="space-y-4">
            <div>
              <label htmlFor={`${formId}-template`} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Template
              </label>
              <select
                id={`${formId}-template`}
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value as TemplateId);
                  setTemplateFields({});
                }}
                className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:border-accent focus:outline-none"
              >
                <option value="">Select a template&hellip;</option>
                {templates &&
                  (Object.keys(templates) as TemplateId[]).map((id) => (
                    <option key={id} value={id}>
                      {templates[id].label}
                    </option>
                  ))}
              </select>
              {selectedTemplate && <p className="mt-1.5 text-[13px] text-ink-muted">{selectedTemplate.description}</p>}
            </div>
            {selectedTemplate?.required_fields.map((field) => (
              <div key={field}>
                <label htmlFor={`${formId}-${field}`} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {FIELD_LABEL[field] ?? field}
                </label>
                <input
                  id={`${formId}-${field}`}
                  value={templateFields[field] ?? ""}
                  onChange={(e) => setTemplateFields((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
                  placeholder={FIELD_PLACEHOLDER[field] ?? ""}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={applySample}
            className="text-[13px] font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
            disabled={mode === "TEMPLATE"}
          >
            Use sample input
          </button>
          <button
            type="submit"
            disabled={!isValid || state.phase === "pending"}
            className="rounded-full bg-dark px-6 py-2.5 text-[14px] font-medium text-white transition-all hover:-translate-y-px hover:bg-dark-hover disabled:pointer-events-none disabled:opacity-35"
          >
            {state.phase === "pending" ? "Filing…" : "File Case →"}
          </button>
        </div>

        {state.phase === "error" && (
          <div role="alert" className="rounded-[14px] border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">
            {state.message}
            <button type="button" onClick={() => setState({ phase: "idle" })} className="ml-3 underline">
              Try again
            </button>
          </div>
        )}

        {state.phase === "success" && (
          <div className="rounded-[14px] border border-success-border bg-success-bg px-4 py-3 text-[13px] text-success">
            Case #{state.caseId} filed.{" "}
            <a
              className="underline"
              href={`/cases/${state.caseId}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/cases/${state.caseId}`);
              }}
            >
              View case →
            </a>{" "}
            &middot;{" "}
            <a className="underline" href={state.explorerUrl} target="_blank" rel="noreferrer">
              Explorer
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
