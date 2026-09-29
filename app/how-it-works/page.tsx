export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">How it works</h1>
      </div>

      <ol className="list-inside list-decimal space-y-4 text-[14px] leading-relaxed text-ink">
        <li>
          <strong className="text-ink">File a case.</strong> Pick a mode — Snapshot (one URL, one
          claim), Conflict (two or three URLs, one question), or Template (a built-in check). The
          contract rejects malformed input immediately, before any network or LLM call.
        </li>
        <li>
          <strong className="text-ink">Resolve it.</strong> Anyone can trigger resolution. Inside
          the contract, each validator independently fetches the live page(s) and asks an LLM to
          judge the evidence.
        </li>
        <li>
          <strong className="text-ink">Consensus.</strong> GenLayer&rsquo;s Equivalence Principle
          reconciles the validators&rsquo; answers — they must agree on the verdict itself, though
          their wording can differ. If they can&rsquo;t agree, or the fetch fails outright, the
          case resolves to an honest <code className="text-[13px]">INSUFFICIENT</code> (or{" "}
          <code className="text-[13px]">GONE</code> for a dead Snapshot URL) rather than a guess.
        </li>
        <li>
          <strong className="text-ink">Receipt.</strong> The verdict, reasons, risk flags, and
          short source notes are written on-chain and permanently viewable at a shareable URL.
        </li>
      </ol>

      <div>
        <h2 className="text-[16px] font-semibold text-ink">What this is not</h2>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-[14px] text-ink-secondary">
          <li>Not a licensed notarial act, and not legally binding.</li>
          <li>Not immune to LLM variance — a verdict is a good-faith read, not a fact of law.</li>
          <li>
            Not permanent in the way mainnet is: Studionet is a development network and its state
            can reset.
          </li>
          <li>Not a record of the page forever — a verdict reflects the page at resolution time.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-[16px] font-semibold text-ink">What we deliberately left out</h2>
        <p className="mt-2 text-[14px] text-ink-secondary">
          No escrow, no payments beyond network fees, no tokens, no custom user-defined templates,
          no off-chain database — the contract is the only source of truth, and no verdict is
          ever computed in this frontend.
        </p>
      </div>
    </div>
  );
}
