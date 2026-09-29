import { Check } from "lucide-react";

/**
 * Three abstract nodes representing the network reviewing evidence in
 * parallel. This is deliberately generic — OpenNotum has no per-validator
 * telemetry to show truthfully, so it never claims specific validator
 * identities, counts, or individual statuses (see PRD "no fabricated
 * network statistics"). It only ever communicates two real states: still
 * working, or done.
 */
export function ConsensusIndicator({ done }: { done: boolean }) {
  return (
    <div className="flex items-center justify-center gap-6 py-6" aria-hidden={false} aria-label={done ? "Consensus reached" : "Validators reviewing"}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500 ${
            done
              ? "border-success bg-success-bg text-success"
              : "animate-gentle-pulse border-accent-border bg-accent-bg text-accent"
          }`}
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          {done ? <Check size={20} /> : <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
        </div>
      ))}
    </div>
  );
}
