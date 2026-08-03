import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SupabaseAuthRedirectHandler } from "@/components/auth/supabase-auth-hash-handler";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Redemption Home Services",
    template: "%s | Redemption Home Services",
  },
  description:
    "Reliable handyman and property-maintenance services in Columbus and Central Ohio. Request service, track jobs, and communicate with our team.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SupabaseAuthRedirectHandler />
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
