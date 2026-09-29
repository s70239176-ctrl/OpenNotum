"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ExternalLink, Share2 } from "lucide-react";
import type { CaseRecord } from "@/lib/cases";
import { CONTRACT_ADDRESS, explorerAddressUrl } from "@/lib/genlayer";

export function ReceiptCard({ record }: { record: CaseRecord }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<"link" | "id" | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(typeof window !== "undefined" ? window.location.href : "");
  }, []);

  useEffect(() => {
    if (canvasRef.current && shareUrl) {
      QRCode.toCanvas(canvasRef.current, shareUrl, { width: 112, margin: 1, color: { dark: "#111318", light: "#ffffff" } }).catch(
        () => {},
      );
    }
  }, [shareUrl]);

  function copy(text: string, which: "link" | "id") {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(which);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(() => {});
  }

  async function share() {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({ title: `OpenNotum case #${record.id}`, url: shareUrl });
        return;
      } catch {
        // fall through to clipboard copy
      }
    }
    copy(shareUrl, "link");
  }

  return (
    <div className="rounded-[24px] border border-line bg-surface p-6">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Verified Record</div>
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <dl className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] text-ink-muted">Case</dt>
            <dd className="mt-0.5 text-[14px] font-medium text-ink">#{record.id}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-muted">Resolved</dt>
            <dd className="mt-0.5 text-[14px] font-medium text-ink">{record.resolved_at || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-muted">Confidence</dt>
            <dd className="mt-0.5 text-[14px] font-medium text-ink capitalize">{record.confidence || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-muted">Filer</dt>
            <dd className="mt-0.5 truncate font-mono text-[13px] text-ink">{record.filer}</dd>
          </div>
        </dl>
        {shareUrl && (
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <canvas ref={canvasRef} className="rounded-[10px] border border-line" />
            <span className="text-[11px] text-ink-muted">Scan to verify</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
        <button
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-full bg-dark px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-dark-hover"
        >
          {copied === "link" ? <Check size={14} /> : <Share2 size={14} />}
          {copied === "link" ? "Copied" : "Share Receipt"}
        </button>
        <button
          onClick={() => copy(record.id, "id")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          {copied === "id" ? <Check size={14} /> : <Copy size={14} />}
          {copied === "id" ? "Copied" : "Copy case ID"}
        </button>
        {CONTRACT_ADDRESS && (
          <a
            href={explorerAddressUrl(CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            View on Chain <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
