import Link from "next/link";
import type { SiteSettings } from "@/generated/prisma/client";

export function PublicFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <p className="text-lg font-semibold">{settings.companyName}</p>
          <p className="text-sm text-muted-foreground">{settings.tagline}</p>
          <p className="text-sm text-muted-foreground">{settings.serviceArea}</p>
        </div>
        <div>
          <p className="mb-3 font-medium">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/login">Customer Login</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-medium">Contact</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{settings.phone}</li>
            <li>{settings.email}</li>
            <li>{settings.businessHours}</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-medium">Legal</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
          <div className="mt-4 flex gap-3 text-sm">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
      </div>
    </footer>
  );
}
