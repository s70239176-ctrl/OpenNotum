"use client";

import { useState } from "react";
import { ShieldCheck, Link2, Globe2 } from "lucide-react";
import { UrlInput } from "@/components/UrlInput";
import { CaseForm } from "@/components/CaseForm";

const URL_RE = /https?:\/\/\S+/i;

export function VerifyFlow() {
  const [quick, setQuick] = useState("");
  const [seed, setSeed] = useState({ url: "", claim: "", key: 0 });

  function handleQuickSubmit() {
    const match = quick.match(URL_RE);
    const url = match ? match[0].replace(/[.,)\]]+$/, "") : "";
    const claim = url ? quick.replace(url, "").trim() : quick.trim();
    setSeed((s) => ({ url, claim, key: s.key + 1 }));
    requestAnimationFrame(() => {
      document.getElementById("case-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-xl px-6 pb-16 pt-8 sm:pb-20">
        <UrlInput value={quick} onChange={setQuick} onSubmit={handleQuickSubmit} />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-success" /> Independent validation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Link2 size={15} className="text-success" /> On-chain attestation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe2 size={15} className="text-success" /> Publicly verifiable
          </span>
        </div>
      </div>
      <div id="case-form">
        <CaseForm key={seed.key} initialUrl={seed.url} initialClaim={seed.claim} />
      </div>
    </div>
  );
}
