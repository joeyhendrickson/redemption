import { db } from "@/lib/db";
import type { SiteSettings } from "@/generated/prisma/client";

const DEFAULT_SETTINGS: Omit<SiteSettings, "createdAt" | "updatedAt"> = {
  id: "default",
  companyName: "Redemption Home Services",
  tagline: "Reliable repairs. Clear communication. Work completed with care.",
  logoUrl: null,
  primaryColor: "#000000",
  accentColor: "#000000",
  phone: "(614) 555-0199",
  email: "hello@redemptionhomeservices.com",
  address: "Columbus, Ohio",
  serviceArea: "Columbus and Central Ohio",
  businessHours: "Mon–Fri 8am–6pm, Sat 9am–2pm",
  emergencyDisclaimer:
    "We are not an emergency service. For fire, gas leaks, major flooding, or life-threatening situations, call 911 immediately.",
  facebookUrl: null,
  instagramUrl: null,
  linkedinUrl: null,
  googleBusinessUrl: null,
  aboutStory:
    "Redemption Home Services was built on a simple belief: homeowners deserve dependable repairs, honest communication, and work done with care. We serve Columbus and Central Ohio with skilled handyman and property-maintenance services.",
  mission: "Restore confidence in every home we touch.",
  values: "Integrity, craftsmanship, respect, and clear communication.",
  servicePhilosophy:
    "We listen first, explain options clearly, protect your property, and leave every job cleaner than we found it.",
  professionalStandards:
    "Our team arrives on time, communicates proactively, and documents work thoroughly.",
  licensingLanguage: null,
  insuranceLanguage: null,
  progressMethod: "EQUAL_WEIGHT",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
    if (settings) return settings;
  } catch {
    // Database may not be configured yet during build
  }
  return {
    ...DEFAULT_SETTINGS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export { DEFAULT_SETTINGS };
