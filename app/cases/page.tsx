import { CaseList } from "@/components/CaseList";

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink">Docket</h1>
        <p className="mt-1 text-ink-muted">The latest attestations filed on Studionet.</p>
      </div>
      <CaseList />
    </div>
  );
}
