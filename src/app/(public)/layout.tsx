import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getSiteSettings } from "@/lib/site-settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <PublicHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
