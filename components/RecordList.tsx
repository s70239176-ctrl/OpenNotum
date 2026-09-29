"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { getLatest, MODE_LABEL, type CaseRecord, type Mode } from "@/lib/cases";
import { RecordRow } from "@/components/RecordRow";
import { formatError, isContractConfigured } from "@/lib/genlayer";

type LoadState = { phase: "loading" } | { phase: "loaded"; cases: CaseRecord[] } | { phase: "error"; message: string };

const FILTERS: Array<{ id: "ALL" | Mode; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "SNAPSHOT", label: MODE_LABEL.SNAPSHOT },
  { id: "CONFLICT", label: MODE_LABEL.CONFLICT },
  { id: "TEMPLATE", label: MODE_LABEL.TEMPLATE },
];

export function RecordList({ limit = 50 }: { limit?: number }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [filter, setFilter] = useState<"ALL" | Mode>("ALL");
  const [query, setQuery] = useState("");

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
        if (!cancelled) setState({ phase: "error", message: formatError(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const filtered = useMemo(() => {
    if (state.phase !== "loaded") return [];
    const q = query.trim().toLowerCase();
    return state.cases.filter((c) => {
      if (filter !== "ALL" && c.mode !== filter) return false;
      if (!q) return true;
      return (
        c.claim_or_question.toLowerCase().includes(q) ||
        c.template_id.toLowerCase().includes(q) ||
        c.id.includes(q)
      );
    });
  }, [state, filter, query]);

  if (state.phase === "loading") {
    return <div className="text-[14px] text-ink-secondary">Loading your records&hellip;</div>;
  }
  if (state.phase === "error") {
    return (
      <div className="rounded-[14px] border border-danger-border bg-danger-bg px-4 py-3 text-[14px] text-danger">
        {state.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                filter === f.id ? "bg-dark text-white" : "bg-neutral-bg text-ink-secondary hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your records…"
            className="w-full rounded-full border border-line bg-surface py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[20px] border border-line bg-surface px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-ink">No records match yet.</p>
          <p className="mt-1 text-[13px] text-ink-muted">Your verified attestations will appear here.</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-dark px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-dark-hover"
          >
            Create your first case →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-line rounded-[20px] border border-line bg-surface">
          {filtered.map((c) => (
            <RecordRow key={c.id} record={c} />
          ))}
        </div>
      )}
    </div>
  );
}
