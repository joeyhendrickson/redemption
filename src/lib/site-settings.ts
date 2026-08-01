import { db } from "@/lib/db";
import type { SiteSettings } from "@/generated/prisma/client";

const DEFAULT_SETTINGS: Omit<SiteSettings, "createdAt" | "updatedAt"> = {
  id: "default",
  companyName: "Redemption Home Services",
  tagline: "Homes repaired, fixed, and redeemed with care.",
  logoUrl: null,
  primaryColor: "#000000",
  accentColor: "#C9A227",
  phone: "(614) 747-1926",
  email: "hello@redemptionhomeservices.com",
  address: "Columbus, Ohio",
  serviceArea: "Columbus and Central Ohio",
  businessHours: "Mon-Fri 3pm-9pm, Sat-Sun 9am-9pm",
  emergencyDisclaimer: "",
  facebookUrl: null,
  instagramUrl: null,
  linkedinUrl: null,
  googleBusinessUrl: null,
  aboutStory:
    "Redemption Home Services was founded on a simple conviction: every home is worth caring for, and every neighbor deserves to be treated with dignity. Our name reflects what we believe restoration should look like—not merely fixing what is broken, but renewing peace, order, and confidence in the places where families live, work, and gather.\n\nWe began serving Columbus and Central Ohio because this is our community. The homes here hold stories, memories, and responsibility. We do not take that lightly. Whether we are repairing a rental between tenants or helping a longtime homeowner with a punch list, we approach each job as stewards—entrusted with someone else's space and called to leave it better than we found it.\n\nThat spirit of service guides everything we do. We are grateful for the trust our neighbors place in us, and we work each day to earn it again.",
  mission:
    "To restore homes and renew trust—serving our neighbors with skilled work, honest communication, and a heart for what is right.",
  values:
    "Stewardship — We treat every property as a sacred trust, caring for it as if it were our own.\n\nIntegrity — We speak truthfully, quote fairly, and keep our word—even when it is inconvenient.\n\nHumility — We listen first, admit when we do not know, and pursue the right solution, not the easiest one.\n\nCompassion — We remember that home problems carry real stress, and we respond with patience, respect, and kindness.\n\nExcellence — We pursue quality not for applause, but because worthy work honors the people we serve.",
  servicePhilosophy:
    "We believe good service begins with presence: showing up when promised, treating people with dignity, and working as if every home matters—because it does. We listen before we recommend, explain options in plain language, and never pressure a homeowner into work they do not need.\n\nWe protect your property while we work, communicate proactively if plans change, and leave every space cleaner than we found it. Our goal is not only to fix what is broken, but to bring peace of mind back to the household. Every visit is an opportunity to serve—to do good work with a good spirit, and to treat our neighbors the way we would want to be treated.",
  professionalStandards:
    "We arrive on time, prepared, and ready to work. Our team communicates clearly from estimate through completion, documents work thoroughly, and stands behind our craftsmanship. We follow safety practices, respect your home and schedule, and address concerns promptly and honestly.\n\nWe hold ourselves to a standard of character as well as skill—because how the work is done matters as much as the result. Dependability, transparency, and respect are not extras on our checklist; they are the foundation of every job we take on.",
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
