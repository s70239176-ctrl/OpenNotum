"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";

const LINKS = [
  { href: "/", label: "Verify" },
  { href: "/cases", label: "Records" },
  { href: "/network", label: "Network" },
  { href: "/templates", label: "Templates" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
          <LogoMark size={24} />
          OpenNotum
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-full px-3.5 py-1.5 text-[14px] transition-colors ${
                    active ? "bg-neutral-bg text-ink" : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[12px] text-ink-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Studionet
          </span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line px-6 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[15px] text-ink hover:bg-neutral-bg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[12px] text-ink-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Studionet
          </span>
        </div>
      )}
    </header>
  );
}
