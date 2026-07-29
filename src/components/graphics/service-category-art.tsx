import type { ServiceGraphicVariant } from "@/lib/service-graphics";
import { cn } from "@/lib/utils";

function HandymanArt() {
  return (
    <>
      <rect x="18" y="34" width="44" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M40 44V58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 58H52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M58 30L72 44L58 58" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  );
}

function PlumbingArt() {
  return (
    <>
      <path d="M24 28V52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 28V52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 40H56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="58" r="6" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function PaintingArt() {
  return (
    <>
      <rect x="22" y="24" width="36" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M40 52V64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 64H50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 34H52" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </>
  );
}

function ElectricalArt() {
  return (
    <path
      d="M44 22L30 42H40L36 66L54 40H44L44 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
}

function KitchenArt() {
  return (
    <>
      <rect x="20" y="24" width="40" height="34" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M20 38H60" stroke="currentColor" strokeWidth="2" />
      <circle cx="30" cy="31" r="2" fill="currentColor" />
      <circle cx="40" cy="31" r="2" fill="currentColor" />
      <circle cx="50" cy="31" r="2" fill="currentColor" />
    </>
  );
}

function HouseArt() {
  return (
    <>
      <path d="M40 18L18 36V62H62V36L40 18Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="34" y="44" width="12" height="18" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

const ART: Record<ServiceGraphicVariant, () => React.ReactNode> = {
  handyman: HandymanArt,
  carpentry: HandymanArt,
  painting: PaintingArt,
  flooring: HouseArt,
  kitchen: KitchenArt,
  plumbing: PlumbingArt,
  electrical: ElectricalArt,
  hvac: HouseArt,
  exterior: HouseArt,
  property: HouseArt,
  default: HouseArt,
};

export function ServiceCategoryArt({
  variant,
  className,
}: {
  variant: ServiceGraphicVariant;
  className?: string;
}) {
  const Art = ART[variant] ?? ART.default;

  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/30 text-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 80 80" className="h-10 w-10" aria-hidden>
        <Art />
      </svg>
    </div>
  );
}
