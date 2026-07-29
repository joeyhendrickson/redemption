export function RepairPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="repair-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#repair-grid)" />
      <circle cx="320" cy="80" r="48" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <circle cx="80" cy="320" r="64" stroke="currentColor" strokeWidth="1" opacity="0.12" />
      <path
        d="M280 280L340 220M60 120L120 60"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.18"
        strokeLinecap="round"
      />
    </svg>
  );
}
