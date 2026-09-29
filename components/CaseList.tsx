"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatest, MODE_LABEL, type CaseRecord } from "@/lib/cases";
import { StatusPill, VerdictBadge } from "@/components/VerdictBadge";
import { isContractConfigured } from "@/lib/genlayer";

type LoadState = { phase: "loading" } | { phase: "loaded"; cases: CaseRecord[] } | { phase: "error"; message: string };

export function CaseList({ limit = 25 }: { limit?: number }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  useEffect(() => {
    if (!isContractConfigured()) {
      setState({ phase: "error", message: "Contract not configured yet." });
      return;
    }
    let cancelled = false;
    getLatest(limit)
      .then((cases) => {
        if (!cancelled) setState({ phase: "loaded", cases });
      })
      .catch((err) => {
        if (!cancelled) setState({ phase: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (state.phase === "loading") {
    return <div className="text-ink-muted">Loading the docket&hellip;</div>;
  }
  if (state.phase === "error") {
    return <div className="rounded-md border border-gone/40 bg-gone/10 px-4 py-3 text-sm text-gone">{state.message}</div>;
  }
  if (state.cases.length === 0) {
    return <div className="text-ink-muted">No cases filed yet. Be the first.</div>;
  }

  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-card">
      {state.cases.map((c) => (
        <li key={c.id}>
          <Link href={`/cases/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper-dim">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-faint">
                <span>#{c.id}</span>
                <span>&middot;</span>
                <span>{MODE_LABEL[c.mode]}</span>
              </div>
              <p className="truncate text-ink">{c.claim_or_question || c.template_id}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusPill status={c.status} />
              {c.status === "FINAL" && <VerdictBadge verdict={c.verdict} />}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
