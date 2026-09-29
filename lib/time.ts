/** Formats an ISO/epoch-ish timestamp as relative time, or a dash if absent — never fabricated. */
export function timeAgo(value: string): string {
  if (!value) return "—";
  const ms = /^\d+$/.test(value) ? Number(value) * 1000 : Date.parse(value);
  if (!Number.isFinite(ms)) return "—";
  const diffSec = Math.round((Date.now() - ms) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  return `${diffDay}d ago`;
}
