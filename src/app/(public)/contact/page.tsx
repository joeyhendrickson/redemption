import { getSiteSettings } from "@/lib/site-settings";
import ContactPageClient from "@/components/public/contact-page-client";

export const metadata = { title: "Contact | Redemption Home Services" };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <ContactPageClient settings={settings} />;
}
