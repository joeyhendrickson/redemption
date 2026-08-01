import { getSiteSettings } from "@/lib/site-settings";
import { TeamProfilesSection } from "@/components/public/team-profiles-section";

export const metadata = { title: "About | Redemption Home Services" };

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">About {settings.companyName}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{settings.tagline}</p>

      <div className="prose prose-neutral mt-10 max-w-none space-y-8 dark:prose-invert">
        <section>
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{settings.aboutStory}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Mission</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{settings.mission}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Values</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{settings.values}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Service Philosophy</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{settings.servicePhilosophy}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Professional Standards</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{settings.professionalStandards}</p>
        </section>
        <TeamProfilesSection />
        <section>
          <h2 className="text-2xl font-semibold">Service Area</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{settings.serviceArea}</p>
        </section>
        {settings.licensingLanguage ? (
          <section>
            <h2 className="text-2xl font-semibold">Licensing</h2>
            <p className="mt-3 text-muted-foreground">{settings.licensingLanguage}</p>
          </section>
        ) : null}
        {settings.insuranceLanguage ? (
          <section>
            <h2 className="text-2xl font-semibold">Insurance</h2>
            <p className="mt-3 text-muted-foreground">{settings.insuranceLanguage}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
