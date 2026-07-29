import Image from "next/image";
import { RepairPattern } from "@/components/graphics/repair-pattern";
import { cn } from "@/lib/utils";

export function PageHeroBanner({
  title,
  description,
  eyebrow,
  imageSrc,
  imageAlt,
  dark = false,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  imageSrc?: string;
  imageAlt?: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        dark ? "bg-black text-white" : "bg-muted/20",
      )}
    >
      <RepairPattern
        className={cn(
          "absolute right-0 top-0 h-64 w-64 opacity-40",
          dark ? "text-white/10" : "text-foreground/5",
        )}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <div className="relative z-10 space-y-4">
          {eyebrow ? (
            <p className={cn("text-sm uppercase tracking-[0.18em]", dark ? "text-white/70" : "text-muted-foreground")}>
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {description ? (
            <p className={cn("max-w-2xl text-lg", dark ? "text-white/80" : "text-muted-foreground")}>
              {description}
            </p>
          ) : null}
          {children}
        </div>
        {imageSrc ? (
          <div className="relative z-10 overflow-hidden rounded-3xl border bg-background shadow-sm">
            <Image
              src={imageSrc}
              alt={imageAlt ?? title}
              width={720}
              height={540}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
