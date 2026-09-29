"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CaseRecord } from "@/lib/cases";

export function EvidencePanel({ record }: { record: CaseRecord }) {
  const [open, setOpen] = useState(false);
  const hasEvidence = record.reasons.length > 0 || record.source_notes.length > 0 || record.risk_flags.length > 0;
  if (!hasEvidence) return null;

  return (
    <div className="rounded-[20px] border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-[14px] font-medium text-ink">Why this result?</span>
        <ChevronDown size={16} className={`text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-5 border-t border-line px-5 py-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Sources</div>
            {record.mode === "TEMPLATE" ? (
              <div className="mt-1.5 space-y-1 text-[13px] text-ink">
                {Object.entries(record.template_fields).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-ink-muted">{k}:</span> {v}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-1.5 space-y-1">
                {record.urls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noreferrer" className="break-all text-[13px] text-accent hover:underline">
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {record.reasons.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Observed</div>
              <ul className="mt-1.5 space-y-1.5">
                {record.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-ink">
                    <span className="text-success">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {record.source_notes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Source notes</div>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-[13px] text-ink-secondary">
                {record.source_notes.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Risk flags</div>
            {record.risk_flags.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {record.risk_flags.map((f, i) => (
                  <span key={i} className="rounded-full border border-warn-border bg-warn-bg px-2.5 py-0.5 text-[11px] text-warn">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1.5 text-[13px] text-ink-muted">None detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
