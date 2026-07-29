import { RepairPattern } from "@/components/graphics/repair-pattern";
import { cn } from "@/lib/utils";

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur", className)}>
      <RepairPattern className="absolute inset-0 h-full w-full text-white/20" />
      <svg
        viewBox="0 0 480 360"
        className="relative z-10 h-full w-full"
        role="img"
        aria-label="Home repair illustration with house, tools, and ladder"
      >
        <title>Home repair services illustration</title>
        <rect x="40" y="180" width="400" height="140" rx="8" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.25" />
        <path
          d="M120 180L240 70L360 180"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="190" y="180" width="100" height="140" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="3" />
        <rect x="220" y="230" width="40" height="90" fill="none" stroke="white" strokeWidth="3" />
        <rect x="150" y="210" width="36" height="36" fill="none" stroke="white" strokeWidth="3" />
        <rect x="294" y="210" width="36" height="36" fill="none" stroke="white" strokeWidth="3" />
        <line x1="150" y1="228" x2="186" y2="228" stroke="white" strokeWidth="2" opacity="0.5" />
        <line x1="294" y1="228" x2="330" y2="228" stroke="white" strokeWidth="2" opacity="0.5" />
        <line x1="168" y1="210" x2="168" y2="246" stroke="white" strokeWidth="2" opacity="0.5" />
        <line x1="312" y1="210" x2="312" y2="246" stroke="white" strokeWidth="2" opacity="0.5" />

        <g transform="translate(70 120)">
          <rect x="0" y="18" width="54" height="12" rx="2" fill="none" stroke="white" strokeWidth="3" />
          <line x1="27" y1="30" x2="27" y2="48" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="48" x2="38" y2="48" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g transform="translate(350 110)">
          <rect x="0" y="0" width="48" height="36" rx="3" fill="none" stroke="white" strokeWidth="3" />
          <line x1="24" y1="36" x2="24" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="56" x2="36" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g transform="translate(355 250)">
          <path d="M0 0L18 30H-18L0 0Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" />
          <line x1="0" y1="30" x2="0" y2="58" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g transform="translate(88 250)">
          <rect x="0" y="0" width="28" height="42" rx="2" fill="none" stroke="white" strokeWidth="3" />
          <line x1="8" y1="10" x2="20" y2="10" stroke="white" strokeWidth="2" />
          <line x1="8" y1="18" x2="20" y2="18" stroke="white" strokeWidth="2" />
          <line x1="8" y1="26" x2="20" y2="26" stroke="white" strokeWidth="2" />
        </g>

        <circle cx="240" cy="52" r="10" fill="white" fillOpacity="0.12" stroke="white" strokeWidth="2" />
        <path d="M240 42V28M234 34H246" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
