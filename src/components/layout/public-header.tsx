import Link from "next/link";
import { Phone, Mail, Menu } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SiteSettings } from "@/generated/prisma/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
            RH
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold leading-tight">{settings.companyName}</p>
            <p className="text-xs text-muted-foreground">{settings.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink variant="ghost" href="/login">Customer Login</ButtonLink>
          <ButtonLink href="/#request-service" className="bg-black text-white hover:bg-black/90">
            Request Service
          </ButtonLink>
        </div>

        <Sheet>
          <SheetTrigger className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-lg font-medium">
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="text-lg font-medium">
                Customer Login
              </Link>
              <ButtonLink href="/#request-service" className="bg-black text-white hover:bg-black/90">
                Request Service
              </ButtonLink>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-2 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {settings.phone}
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            {settings.email}
          </span>
          <span>Serving {settings.serviceArea}</span>
        </div>
      </div>
    </header>
  );
}
