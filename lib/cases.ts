/** OpenNotum-contract-specific calls, built on the generic lib/genlayer.ts client. */
import { readContract, writeContract, type WalletClient, type WriteResult } from "./genlayer";

export type Mode = "SNAPSHOT" | "CONFLICT" | "TEMPLATE";
export type Status = "OPEN" | "RESOLVING" | "FINAL" | "FAILED";

export type SnapshotVerdict = "CONFIRMED" | "CHANGED" | "GONE" | "INSUFFICIENT";
export type ConflictVerdict = "AGREED" | "CONFLICT" | "INSUFFICIENT";
export type TemplateVerdict = "PASS" | "FAIL" | "INSUFFICIENT";
export type Verdict = SnapshotVerdict | ConflictVerdict | TemplateVerdict | "";

export type TemplateId = "github_release" | "company_ir" | "status_page";

export interface CaseRecord {
  id: string;
  mode: Mode;
  status: Status;
  filer: string;
  created_at: string;
  claim_or_question: string;
  urls: string[];
  template_id: string;
  template_fields: Record<string, string>;
  verdict: Verdict;
  confidence: string;
  reasons: string[];
  risk_flags: string[];
  source_notes: string[];
  resolved_at: string;
  resolve_tx_hint: string;
}

export interface TemplateDef {
  label: string;
  description: string;
  required_fields: string[];
}

export interface Stats {
  total_cases: number;
  open: number;
  final: number;
  failed: number;
}

function parseJson<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function getCase(caseId: string): Promise<CaseRecord | null> {
  const text = await readContract("get_case", [caseId]);
  if (!text) return null;
  return parseJson<CaseRecord | null>(text, null);
}

export async function getLatest(limit: number): Promise<CaseRecord[]> {
  const text = await readContract("get_latest", [limit]);
  return parseJson<CaseRecord[]>(text, []);
}

export async function getCasesByFiler(address: string): Promise<CaseRecord[]> {
  const text = await readContract("get_cases_by_filer", [address]);
  return parseJson<CaseRecord[]>(text, []);
}

export async function getStats(): Promise<Stats> {
  const text = await readContract("get_stats", []);
  return parseJson<Stats>(text, { total_cases: 0, open: 0, final: 0, failed: 0 });
}

export async function getTemplates(): Promise<Record<TemplateId, TemplateDef>> {
  const text = await readContract("get_templates", []);
  return parseJson<Record<TemplateId, TemplateDef>>(text, {} as Record<TemplateId, TemplateDef>);
}

export interface CreateCaseInput {
  mode: Mode;
  claimOrQuestion: string;
  urls: string[];
  templateId?: TemplateId | "";
  templateFields?: Record<string, string>;
}

export async function createCase(client: WalletClient, input: CreateCaseInput): Promise<WriteResult & { caseId: string }> {
  const urlsField = JSON.stringify(input.urls ?? []);
  const templateFieldsField = JSON.stringify(input.templateFields ?? {});
  const result = await writeContract(client, "create_case", [
    input.mode,
    input.claimOrQuestion,
    urlsField,
    input.templateId ?? "",
    templateFieldsField,
  ]);
  return { ...result, caseId: result.returnValue };
}

export async function resolveCase(client: WalletClient, caseId: string): Promise<WriteResult & { verdict: string }> {
  const result = await writeContract(client, "resolve", [caseId]);
  return { ...result, verdict: result.returnValue };
}

export const VERDICT_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  CHANGED: "Changed",
  GONE: "Gone",
  AGREED: "Agreed",
  CONFLICT: "Conflict",
  PASS: "Pass",
  FAIL: "Fail",
  INSUFFICIENT: "Insufficient",
  "": "Pending",
};

export const VERDICT_TONE: Record<string, "positive" | "negative" | "neutral" | "pending"> = {
  CONFIRMED: "positive",
  AGREED: "positive",
  PASS: "positive",
  CHANGED: "negative",
  CONFLICT: "negative",
  FAIL: "negative",
  GONE: "neutral",
  INSUFFICIENT: "pending",
  "": "pending",
};

export const VERDICT_EXPLANATION: Record<string, string> = {
  CONFIRMED: "The live page substantively supports the claim.",
  CHANGED: "The page is reachable but does not support the claim.",
  GONE: "The source was unavailable when the network resolved this case.",
  AGREED: "The sources gave a compatible answer to the question.",
  CONFLICT: "The sources gave incompatible answers to the question.",
  PASS: "The template's condition held.",
  FAIL: "The template's condition did not hold.",
  INSUFFICIENT: "The network could not establish a result from the available evidence.",
  "": "This case has not been resolved yet.",
};

export const MODE_LABEL: Record<Mode, string> = {
  SNAPSHOT: "Snapshot",
  CONFLICT: "Conflict",
  TEMPLATE: "Template",
};

export const SAMPLES: Record<Mode, { claimOrQuestion: string; urls: string[] }> = {
  SNAPSHOT: {
    claimOrQuestion: "The GenLayer homepage describes GenLayer as an AI-powered blockchain.",
    urls: ["https://genlayer.com"],
  },
  CONFLICT: {
    claimOrQuestion: "What chain ID does GenLayer Studionet use?",
    urls: ["https://docs.genlayer.com", "https://studio.genlayer.com"],
  },
  TEMPLATE: {
    claimOrQuestion: "",
    urls: [],
  },
};
