import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MobileNavigation } from "@/components/MobileNavigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "OpenNotum — the web changes, proof shouldn't",
  description:
    "OpenNotum creates independently verified records of public web content on GenLayer Studionet. Not a legal notary.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen pb-16 md:pb-0">
        <Navbar />
        <div className="border-b border-line bg-surface px-6 py-1.5 text-center text-[12px] text-ink-muted">
          Studionet development network — records may reset. Not a legal notary.
        </div>
        <main className="mx-auto max-w-[1320px] px-6 py-10 md:py-14">{children}</main>
        <footer className="mx-auto max-w-[1320px] px-6 py-10 text-[12px] text-ink-muted">
          OpenNotum is a decentralized web-attestation tool on GenLayer Studionet. It is not a
          licensed notarial act and creates no legal effect. Studionet is a development network
          and its state can reset.{" "}
          <Link href="/how-it-works" className="underline hover:text-ink-secondary">
            How it works
          </Link>
        </footer>
        <MobileNavigation />
      </body>
    </html>
  );
}
