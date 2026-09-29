"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCase, MODE_LABEL, resolveCase, type CaseRecord } from "@/lib/cases";
import { connectWallet, formatError, isContractConfigured } from "@/lib/genlayer";
import { StatusPill } from "@/components/VerdictBadge";
import { ResolutionTimeline } from "@/components/ResolutionTimeline";
import { ConsensusIndicator } from "@/components/ConsensusIndicator";
import { VerdictCard } from "@/components/VerdictCard";
import { EvidencePanel } from "@/components/EvidencePanel";
import { ReceiptCard } from "@/components/ReceiptCard";

type LoadState = { phase: "loading" } | { phase: "loaded"; record: CaseRecord } | { phase: "missing" } | { phase: "error"; message: string };
type ResolveState = { phase: "idle" } | { phase: "pending"; stage: number } | { phase: "error"; message: string };

export function CaseReceipt({ caseId }: { caseId: string }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [resolveState, setResolveState] = useState<ResolveState>({ phase: "idle" });
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!isContractConfigured()) {
      setState({ phase: "error", message: "Contract not configured yet." });
      return;
    }
    try {
      const record = await getCase(caseId);
      setState(record ? { phase: "loaded", record } : { phase: "missing" });
    } catch (err) {
      setState({ phase: "error", message: formatError(err) });
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (stageTimer.current) clearTimeout(stageTimer.current);
    };
  }, []);

  async function handleResolve() {
    setResolveState({ phase: "pending", stage: 0 });
    try {
      const { client } = await connectWallet();
      setResolveState({ phase: "pending", stage: 1 });
      stageTimer.current = setTimeout(() => setResolveState({ phase: "pending", stage: 2 }), 4000);
      await resolveCase(client, caseId);
      if (stageTimer.current) clearTimeout(stageTimer.current);
      setResolveState({ phase: "pending", stage: 3 });
      await load();
      setResolveState({ phase: "idle" });
    } catch (err) {
      if (stageTimer.current) clearTimeout(stageTimer.current);
      setResolveState({ phase: "error", message: formatError(err) });
    }
  }

  if (state.phase === "loading") return <div className="text-[14px] text-ink-secondary">Loading case #{caseId}&hellip;</div>;
  if (state.phase === "missing")
    return (
      <div className="rounded-[20px] border border-line bg-surface px-6 py-14 text-center text-[14px] text-ink-secondary">
        No case found with id #{caseId}.
      </div>
    );
  if (state.phase === "error")
    return <div className="rounded-[14px] border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">{state.message}</div>;

  const c = state.record;

  if (resolveState.phase === "pending") {
    return (
      <div className="mx-auto max-w-lg space-y-8 py-6 text-center">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Verifying Your Case</h1>
          <p className="mt-2 text-[14px] text-ink-secondary">
            Our network of independent validators is reviewing your claim. This usually takes a
            few minutes on Studionet.
          </p>
        </div>
        <ResolutionTimeline activeIndex={resolveState.stage} />
        <ConsensusIndicator done={resolveState.stage >= 3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wide text-ink-muted">
            <span>Case #{c.id}</span>
            <span>&middot;</span>
            <span>{MODE_LABEL[c.mode]}</span>
          </div>
          <h1 className="mt-1 text-[22px] font-semibold text-ink">{c.claim_or_question || c.template_id}</h1>
        </div>
        <StatusPill status={c.status} />
      </div>

      {c.status === "OPEN" && (
        <div className="rounded-[20px] border border-line bg-surface p-6">
          <p className="mb-4 text-[14px] text-ink-secondary">
            This case is open. Anyone can trigger resolution — validators will fetch the live
            evidence now, not whatever it looked like when the case was filed.
          </p>
          <button
            onClick={handleResolve}
            className="rounded-full bg-dark px-6 py-2.5 text-[14px] font-medium text-white transition-all hover:-translate-y-px hover:bg-dark-hover"
          >
            Resolve now
          </button>
          {resolveState.phase === "error" && (
            <div role="alert" className="mt-4 rounded-[14px] border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">
              We couldn&rsquo;t resolve this case. {resolveState.message}
              <button onClick={() => setResolveState({ phase: "idle" })} className="ml-3 underline">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {c.status === "RESOLVING" && (
        <div className="rounded-[20px] border border-line bg-surface p-6 text-[14px] text-ink-secondary">
          Resolution is in flight. Reload this page in a minute — verdicts only appear here once
          the network has actually finalized them.
        </div>
      )}

      {c.status === "FAILED" && (
        <div className="rounded-[20px] border border-danger-border bg-danger-bg p-6 text-[14px] text-danger">
          Resolution failed — validators could not reach consensus on a well-formed verdict. This
          case cannot be re-resolved automatically; file a new case if you want another attempt.
        </div>
      )}

      {c.status === "FINAL" && (
        <div className="space-y-5">
          <VerdictCard record={c} />
          <EvidencePanel record={c} />
          <ReceiptCard record={c} />
        </div>
      )}
    </div>
  );
}
