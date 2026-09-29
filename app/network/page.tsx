import { ExternalLink } from "lucide-react";
import { getStats } from "@/lib/cases";
import { CHAIN_ID, EXPLORER_URL, RPC_URL, isContractConfigured } from "@/lib/genlayer";
import { NetworkGraph } from "@/components/NetworkGraph";

export default async function NetworkPage() {
  const stats = isContractConfigured() ? await getStats().catch(() => null) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">Network</h1>
        <p className="mt-1.5 text-[15px] text-ink-secondary">A global network of independent validators.</p>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
        <div className="h-40 bg-neutral-bg/60">
          <NetworkGraph />
        </div>
        <div className="grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-5">
            <div className="text-[12px] text-ink-muted">Network</div>
            <div className="mt-1 text-[15px] font-medium text-ink">GenLayer Studionet</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[12px] text-ink-muted">Chain ID</div>
            <div className="mt-1 text-[15px] font-medium text-ink">{CHAIN_ID}</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[12px] text-ink-muted">RPC</div>
            <div className="mt-1 truncate text-[15px] font-medium text-ink">{RPC_URL}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-ink">OpenNotum activity</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Aggregate counts read directly from this app&rsquo;s contract — not estimates.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total cases", value: stats?.total_cases ?? "—" },
            { label: "Open", value: stats?.open ?? "—" },
            { label: "Resolved", value: stats?.final ?? "—" },
            { label: "Failed", value: stats?.failed ?? "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] border border-line bg-surface px-4 py-4">
              <div className="text-[22px] font-semibold text-ink">{s.value}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <a
        href={`${EXPLORER_URL}/validators`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        View live validator activity on the GenLayer explorer <ExternalLink size={13} />
      </a>
    </div>
  );
}
