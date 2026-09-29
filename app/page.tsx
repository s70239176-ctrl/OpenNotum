import { CreateCaseForm } from "@/components/CreateCaseForm";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink">
          Public web attestation.
        </h1>
        <p className="max-w-2xl text-lg text-ink-muted">
          File a case. GenLayer validators independently fetch the live page,
          judge it, and reach consensus. The network issues a shareable,
          on-chain receipt — not a screenshot, not a promise.
        </p>
        <p className="max-w-2xl text-sm text-ink-faint">
          This is decentralized attestation on a development network, not a
          licensed notarial act. See{" "}
          <a href="/how-it-works" className="underline">
            how it works
          </a>{" "}
          for the honest version.
        </p>
      </section>

      <CreateCaseForm />
    </div>
  );
}
