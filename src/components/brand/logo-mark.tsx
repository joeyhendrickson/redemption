import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Redemption Home Services"
      className={cn("h-10 w-10 shrink-0", className)}
    >
      <title>Redemption Home Services</title>
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="10"
        fill="#0A0A0A"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-gold"
      />
      <path
        d="M24 9.5L10.5 22.5V37.5H18.5V27.5H29.5V37.5H37.5V22.5L24 9.5Z"
        fill="currentColor"
        className="text-gold"
      />
    </svg>
  );
}
