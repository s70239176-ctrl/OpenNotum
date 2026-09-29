import Link from "next/link";

const LINKS = [
  { href: "/", label: "File a case" },
  { href: "/cases", label: "Docket" },
  { href: "/templates", label: "Templates" },
  { href: "/how-it-works", label: "How it works" },
];

export function SiteNav() {
  return (
    <header className="border-b border-line bg-paper">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
          OpenNotum
        </Link>
        <ul className="flex items-center gap-6 text-sm text-ink-muted">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
