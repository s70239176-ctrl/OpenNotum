export default function HowItWorksPage() {
  return (
    <div className="prose-none max-w-2xl space-y-6">
      <h1 className="font-serif text-3xl font-semibold text-ink">How it works</h1>

      <ol className="list-inside list-decimal space-y-3 text-ink">
        <li>
          <strong>File a case.</strong> Pick a mode — Snapshot (one URL, one claim), Conflict (two
          or three URLs, one question), or Template (a built-in check). The contract rejects
          malformed input immediately, before any network or LLM call.
        </li>
        <li>
          <strong>Resolve it.</strong> Anyone can trigger resolution. Inside the contract, each
          validator independently fetches the live page(s) and asks an LLM to judge the evidence.
        </li>
        <li>
          <strong>Consensus.</strong> GenLayer&rsquo;s Equivalence Principle reconciles the validators&rsquo;
          answers — they must agree on the verdict itself, though their wording can differ. If
          they can&rsquo;t agree, or the fetch fails outright, the case resolves to an honest
          <code> INSUFFICIENT</code> (or <code>GONE</code> for a dead Snapshot URL) rather than a
          guess.
        </li>
        <li>
          <strong>Receipt.</strong> The verdict, reasons, risk flags, and short source notes are
          written on-chain and permanently viewable at a shareable URL.
        </li>
      </ol>

      <h2 className="font-serif text-xl font-semibold text-ink">What this is not</h2>
      <ul className="list-inside list-disc space-y-2 text-ink-muted">
        <li>Not a licensed notarial act, and not legally binding.</li>
        <li>Not immune to LLM variance — a verdict is a good-faith read, not a fact of law.</li>
        <li>
          Not permanent in the way mainnet is: Studionet is a development network and its state
          can reset.
        </li>
        <li>Not a record of the page forever — a verdict reflects the page at resolution time.</li>
      </ul>

      <h2 className="font-serif text-xl font-semibold text-ink">What we deliberately left out</h2>
      <p className="text-ink-muted">
        No escrow, no payments beyond network fees, no tokens, no custom user-defined templates, no
        off-chain database — the contract is the only source of truth, and no verdict is ever
        computed in this frontend.
      </p>
    </div>
  );
}
