import { RecordList } from "@/components/RecordList";

export default function CasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">Records</h1>
        <p className="mt-1.5 text-[15px] text-ink-secondary">View and browse verified cases on Studionet.</p>
      </div>
      <RecordList />
    </div>
  );
}
