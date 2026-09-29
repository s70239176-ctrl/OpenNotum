import { Check } from "lucide-react";

const STAGES = ["Sending transaction", "Fetching source", "Reaching consensus", "Writing receipt"];

export function ResolutionTimeline({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STAGES.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              <div
                className={`h-px flex-1 ${i === 0 ? "opacity-0" : done || active ? "bg-dark" : "bg-line"}`}
              />
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                  done
                    ? "bg-success text-white"
                    : active
                      ? "bg-dark text-white"
                      : "bg-neutral-bg text-ink-muted"
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <div className={`h-px flex-1 ${i === STAGES.length - 1 ? "opacity-0" : done ? "bg-dark" : "bg-line"}`} />
            </div>
            <span className={`text-[11px] ${active ? "font-medium text-ink" : "text-ink-muted"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
