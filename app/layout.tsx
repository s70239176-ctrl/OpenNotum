import type { Metadata } from "next";
import { StudionetBanner } from "@/components/Banner";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenNotum — public web attestation",
  description:
    "File a case. Validators fetch live pages. GenLayer Studionet issues a shareable receipt. Not a legal notary.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <StudionetBanner />
        <SiteNav />
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-ink-faint">
          OpenNotum is a decentralized web-attestation tool on GenLayer Studionet.
          It is not a licensed notarial act and creates no legal effect.
          Studionet is a development network and its state can reset.
        </footer>
      </body>
    </html>
  );
}
