"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { connectWallet, formatError, isContractConfigured } from "@/lib/genlayer";
import { createCase, getTemplates, MODE_LABEL, SAMPLES, type Mode, type TemplateDef, type TemplateId } from "@/lib/cases";

type SubmitState =
  | { phase: "idle" }
  | { phase: "pending" }
  | { phase: "success"; caseId: string; explorerUrl: string }
  | { phase: "error"; message: string };

const MODES: Mode[] = ["SNAPSHOT", "CONFLICT", "TEMPLATE"];

export function CreateCaseForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("SNAPSHOT");
  const [claimOrQuestion, setClaimOrQuestion] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
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
      <div className="rounded-lg border border-line bg-card p-6 text-ink-muted">
        The contract address is not configured yet
        (<code className="text-ink">NEXT_PUBLIC_CONTRACT_ADDRESS</code>). Filing is disabled until
        deployment is complete.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-line bg-card p-6">
      <div>
        <div className="mb-2 text-sm font-medium text-ink-muted">Mode</div>
        <div className="flex gap-2" role="radiogroup" aria-label="Filing mode">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => switchMode(m)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                mode === m
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {mode !== "TEMPLATE" && (
        <>
          <div>
            <label htmlFor="claim" className="mb-1 block text-sm font-medium text-ink-muted">
              {mode === "SNAPSHOT" ? "Claim" : "Question"}
            </label>
            <textarea
              id="claim"
              value={claimOrQuestion}
              onChange={(e) => setClaimOrQuestion(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:border-accent focus:outline-none"
              placeholder={
                mode === "SNAPSHOT"
                  ? "e.g. The homepage says the product is generally available."
                  : "e.g. Do these sources agree on the release date?"
              }
            />
            <div className="mt-1 text-right text-xs text-ink-faint">{claimOrQuestion.length}/500</div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-muted">
                {mode === "SNAPSHOT" ? "URL" : "URLs (2–3, distinct)"}
              </span>
            </div>
            <div className="space-y-2">
              {urls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder="https://example.com/page"
                    aria-label={`URL ${i + 1}`}
                    className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:border-accent focus:outline-none"
                  />
                  {mode === "CONFLICT" && urls.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeConflictUrl(i)}
                      aria-label={`Remove URL ${i + 1}`}
                      className="rounded-md border border-line px-3 text-ink-muted hover:text-ink"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            {mode === "CONFLICT" && urls.length < 3 && (
              <button
                type="button"
                onClick={addConflictUrl}
                className="mt-2 text-sm text-accent hover:underline"
              >
                + Add a third source
              </button>
            )}
          </div>
        </>
      )}

      {mode === "TEMPLATE" && (
        <div className="space-y-4">
          <div>
            <label htmlFor="template" className="mb-1 block text-sm font-medium text-ink-muted">
              Template
            </label>
            <select
              id="template"
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value as TemplateId);
                setTemplateFields({});
              }}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:border-accent focus:outline-none"
            >
              <option value="">Select a template&hellip;</option>
              {templates &&
                (Object.keys(templates) as TemplateId[]).map((id) => (
                  <option key={id} value={id}>
                    {templates[id].label}
                  </option>
                ))}
            </select>
            {selectedTemplate && <p className="mt-1 text-sm text-ink-faint">{selectedTemplate.description}</p>}
          </div>
          {selectedTemplate?.required_fields.map((field) => (
            <div key={field}>
              <label htmlFor={field} className="mb-1 block text-sm font-medium text-ink-muted">
                {fieldLabel(field)}
              </label>
              <input
                id={field}
                value={templateFields[field] ?? ""}
                onChange={(e) => setTemplateFields((prev) => ({ ...prev, [field]: e.target.value }))}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:border-accent focus:outline-none"
                placeholder={fieldPlaceholder(field)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={applySample}
          className="text-sm text-accent hover:underline"
          disabled={mode === "TEMPLATE"}
        >
          Use sample input
        </button>
        <button
          type="submit"
          disabled={!isValid || state.phase === "pending"}
          className="rounded-md bg-accent px-5 py-2 font-medium text-accent-fg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.phase === "pending" ? "Filing…" : "File case"}
        </button>
      </div>

      {state.phase === "error" && (
        <div role="alert" className="rounded-md border border-gone/40 bg-gone/10 px-4 py-3 text-sm text-gone">
          {state.message}
          <button
            type="button"
            onClick={() => setState({ phase: "idle" })}
            className="ml-3 underline"
          >
            Try again
          </button>
        </div>
      )}

      {state.phase === "success" && (
        <div className="rounded-md border border-confirmed/40 bg-confirmed/10 px-4 py-3 text-sm text-confirmed">
          Case #{state.caseId} filed.{" "}
          <a className="underline" href={`/cases/${state.caseId}`} onClick={(e) => { e.preventDefault(); router.push(`/cases/${state.caseId}`); }}>
            View receipt
          </a>{" "}
          &middot;{" "}
          <a className="underline" href={state.explorerUrl} target="_blank" rel="noreferrer">
            Explorer
          </a>
        </div>
      )}
    </form>
  );
}

function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    repo_url: "Repository URL",
    expected_tag: "Expected tag",
    ir_url: "Investor-relations / news URL",
    claim: "Claim",
    status_url: "Status page URL",
  };
  return labels[field] ?? field;
}

function fieldPlaceholder(field: string): string {
  const placeholders: Record<string, string> = {
    repo_url: "https://github.com/owner/repo",
    expected_tag: "v1.2.0",
    ir_url: "https://investors.example.com/news",
    claim: "e.g. The company announced Q3 earnings on this page.",
    status_url: "https://status.example.com",
  };
  return placeholders[field] ?? "";
}

function describeTemplateClaim(templateId: TemplateId | "", fields: Record<string, string>): string {
  if (templateId === "github_release") {
    return `Expect tag ${fields.expected_tag ?? ""} on ${fields.repo_url ?? ""}`.slice(0, 500);
  }
  if (templateId === "company_ir" || templateId === "status_page") {
    return (fields.claim ?? "").slice(0, 500);
  }
  return "";
}
