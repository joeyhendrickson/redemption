import Link from "next/link";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { ButtonLink } from "@/components/ui/button-link";
import type { UserRole } from "@/generated/prisma/client";

const navByRole: Record<UserRole, { href: string; label: string }[]> = {
  CUSTOMER: [
    { href: "/customer", label: "Dashboard" },
    { href: "/customer/requests", label: "Requests" },
    { href: "/customer/jobs", label: "Jobs" },
    { href: "/customer/messages", label: "Messages" },
  ],
  CONTRACTOR: [
    { href: "/contractor", label: "Dashboard" },
    { href: "/contractor/jobs", label: "Jobs" },
    { href: "/contractor/schedule", label: "Schedule" },
    { href: "/contractor/messages", label: "Messages" },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/requests", label: "Requests" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/contractors", label: "Contractors" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/settings", label: "Site Settings" },
    { href: "/admin/analytics", label: "Analytics" },
  ],
};

export function PortalShell({
  role,
  title,
  userName,
  children,
}: {
  role: UserRole;
  title: string;
  userName: string;
  children: React.ReactNode;
}) {
  const nav = navByRole[role];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <LogoMark className="h-9 w-9" />
            </Link>
            <div>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Redemption Home Services
              </Link>
              <p className="font-semibold">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
            <ButtonLink variant="outline" size="sm" href="/api/auth/signout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </ButtonLink>
          </div>
        </div>
        <nav className="border-t">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
