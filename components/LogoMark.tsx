export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="64" height="64" rx="16" fill="#111827" />
      <circle cx="32" cy="32" r="17" stroke="#4F8CFF" strokeWidth="3" />
      <path d="M23.5 32.5L29 38L41 25" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
