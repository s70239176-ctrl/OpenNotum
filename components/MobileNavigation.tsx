"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Network, LayoutTemplate } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/cases", label: "Records", icon: FileText },
  { href: "/network", label: "Network", icon: Network },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
];

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex items-center justify-around px-2 py-1.5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[11px] ${
                  active ? "text-dark" : "text-ink-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
