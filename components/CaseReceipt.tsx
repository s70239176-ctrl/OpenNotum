"use client";

import { useCallback, useEffect, useState } from "react";
import { getCase, MODE_LABEL, resolveCase, type CaseRecord } from "@/lib/cases";
import { connectWallet, explorerAddressUrl, isContractConfigured } from "@/lib/genlayer";
import { StatusPill, VerdictBadge } from "@/components/VerdictBadge";

type LoadState = { phase: "loading" } | { phase: "loaded"; record: CaseRecord } | { phase: "missing" } | { phase: "error"; message: string };
type ResolveState = { phase: "idle" } | { phase: "pending" } | { phase: "error"; message: string };

export function CaseReceipt({ caseId }: { caseId: string }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [resolveState, setResolveState] = useState<ResolveState>({ phase: "idle" });
  const [lastTx, setLastTx] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isContractConfigured()) {
      setState({ phase: "error", message: "Contract not configured yet." });
      return;
    }
    try {
      const record = await getCase(caseId);
      setState(record ? { phase: "loaded", record } : { phase: "missing" });
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleResolve() {
    setResolveState({ phase: "pending" });
    try {
      const { client } = await connectWallet();
      const result = await resolveCase(client, caseId);
      setLastTx(result.explorerUrl);
      setResolveState({ phase: "idle" });
      await load();
    } catch (err) {
      setResolveState({ phase: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  function copyShareLink() {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  if (state.phase === "loading") return <div className="text-ink-muted">Loading case #{caseId}&hellip;</div>;
  if (state.phase === "missing")
    return <div className="rounded-md border border-line bg-card px-4 py-3 text-ink-muted">No case found with id #{caseId}.</div>;
  if (state.phase === "error")
    return <div className="rounded-md border border-gone/40 bg-gone/10 px-4 py-3 text-sm text-gone">{state.message}</div>;

  const c = state.record;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-faint">
            <span>Case #{c.id}</span>
            <span>&middot;</span>
            <span>{MODE_LABEL[c.mode]}</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">{c.claim_or_question || c.template_id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={c.status} />
          {c.status === "FINAL" && <VerdictBadge verdict={c.verdict} />}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 rounded-lg border border-line bg-card p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-faint">Filer</dt>
          <dd className="mt-1 break-all font-mono text-sm text-ink">
            <a className="hover:underline" href={explorerAddressUrl(c.filer)} target="_blank" rel="noreferrer">
              {c.filer}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-faint">Filed</dt>
          <dd className="mt-1 text-sm text-ink">{c.created_at || "—"}</dd>
        </div>
        {c.mode === "TEMPLATE" ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-ink-faint">Template fields</dt>
            <dd className="mt-1 space-y-1 text-sm text-ink">
              {Object.entries(c.template_fields).map(([k, v]) => (
                <div key={k}>
                  <span className="text-ink-faint">{k}:</span> {v}
                </div>
              ))}
            </dd>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-ink-faint">
              {c.urls.length > 1 ? "URLs" : "URL"}
            </dt>
            <dd className="mt-1 space-y-1 text-sm">
              {c.urls.map((u) => (
                <div key={u}>
                  <a className="break-all text-accent hover:underline" href={u} target="_blank" rel="noreferrer">
                    {u}
                  </a>
                </div>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {c.status === "OPEN" && (
        <div className="rounded-lg border border-line bg-card p-5">
          <p className="mb-3 text-sm text-ink-muted">
            This case is open. Anyone can trigger resolution — validators will fetch the live
            evidence now, not whatever it looked like when the case was filed.
          </p>
          <button
            onClick={handleResolve}
            disabled={resolveState.phase === "pending"}
            className="rounded-md bg-accent px-5 py-2 font-medium text-accent-fg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {resolveState.phase === "pending" ? "Resolving… (this can take a few minutes)" : "Resolve now"}
          </button>
          {resolveState.phase === "error" && (
            <div role="alert" className="mt-3 rounded-md border border-gone/40 bg-gone/10 px-4 py-3 text-sm text-gone">
              {resolveState.message}
              <button onClick={() => setResolveState({ phase: "idle" })} className="ml-3 underline">
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {c.status === "RESOLVING" && (
        <div className="rounded-lg border border-line bg-card p-5 text-sm text-ink-muted">
          Resolution is in flight. Reload this page in a minute — verdicts only appear here once
          the network has actually finalized them.
        </div>
      )}

      {c.status === "FAILED" && (
        <div className="rounded-lg border border-gone/40 bg-gone/10 p-5 text-sm text-gone">
          Resolution failed (validators could not reach consensus on a well-formed verdict). This
          case cannot be re-resolved automatically; file a new case if you want another attempt.
        </div>
      )}

      {c.status === "FINAL" && (
        <div className="space-y-4 rounded-lg border border-line bg-card p-5">
          <div className="flex items-center gap-3 text-sm text-ink-muted">
            <span>Confidence: {c.confidence || "—"}</span>
            <span>&middot;</span>
            <span>Resolved {c.resolved_at || "—"}</span>
          </div>
          {c.reasons.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-wide text-ink-faint">Reasons</h2>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-ink">
                {c.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {c.risk_flags.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-wide text-ink-faint">Risk flags</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                {c.risk_flags.map((f, i) => (
                  <span key={i} className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-muted">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {c.source_notes.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-wide text-ink-faint">Source notes</h2>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-ink-muted">
                {c.source_notes.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {lastTx && (
        <div className="text-sm text-ink-muted">
          Last transaction:{" "}
          <a className="underline" href={lastTx} target="_blank" rel="noreferrer">
            view on explorer
          </a>
        </div>
      )}

      <div className="flex gap-4 text-sm">
        <button onClick={copyShareLink} className="text-accent hover:underline">
          Copy share link
        </button>
      </div>
    </div>
  );
}
