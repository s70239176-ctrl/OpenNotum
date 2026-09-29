import { CaseReceipt } from "@/components/CaseReceipt";

export default async function CaseReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CaseReceipt caseId={id} />;
}
