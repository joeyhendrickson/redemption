const STEPS = [
  {
    label: "Request",
    detail: "Photos & details",
    path: "M20 34H44V58H20V34ZM24 38H40",
  },
  {
    label: "Review",
    detail: "Estimate prepared",
    path: "M22 24H42V52H22V24ZM26 30H38M26 36H34",
  },
  {
    label: "Schedule",
    detail: "Approve & book",
    path: "M20 26H44V54H20V26ZM20 34H44M28 20V30M36 20V30",
  },
  {
    label: "Complete",
    detail: "Track & review",
    path: "M24 52L32 60L52 36",
  },
];

export function ProcessIllustration() {
  return (
    <div className="rounded-2xl border bg-muted/20 p-6">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Your project journey
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <div key={step.label} className="flex items-start gap-4 rounded-xl border bg-background p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <svg viewBox="0 0 64 64" className="h-10 w-10 text-foreground" aria-hidden>
                <rect x="8" y="8" width="48" height="48" rx="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
                <path d={step.path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step {index + 1}
              </p>
              <p className="font-semibold">{step.label}</p>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
