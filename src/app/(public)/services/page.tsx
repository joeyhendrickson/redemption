import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceCategoryArt } from "@/components/graphics/service-category-art";
import { toDisplayServiceCategories } from "@/data/service-catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { getServiceGraphicVariant } from "@/lib/service-graphics";
import { db } from "@/lib/db";

export const metadata = { title: "Services | Redemption Home Services" };

async function getServices() {
  try {
    const categories = await db.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (categories.length > 0) {
      return { categories, fromDatabase: true };
    }
  } catch {
    // Database may not be configured locally yet.
  }

  return { categories: toDisplayServiceCategories(), fromDatabase: false };
}

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const { categories, fromDatabase } = await getServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Handyman, maintenance, and property services for {settings.serviceArea}. Browse categories below or submit a
          service request for a custom quote.
        </p>
        {!fromDatabase ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Showing the full service catalog. Connect your database and run <code className="rounded bg-muted px-1.5 py-0.5">npm run db:seed</code> to sync admin-managed services.
          </p>
        ) : null}
      </div>

      <div className="mt-12 space-y-12">
        {categories.map((category) => (
          <section key={category.id}>
            <div className="flex items-start gap-4">
              <ServiceCategoryArt variant={getServiceGraphicVariant(category.slug, category.name)} />
              <div>
                <h2 className="text-2xl font-semibold">{category.name}</h2>
                {category.description ? (
                  <p className="mt-2 max-w-3xl text-muted-foreground">{category.description}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {category.services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    {service.exampleProjects ? (
                      <p className="text-xs text-muted-foreground">Examples: {service.exampleProjects}</p>
                    ) : null}
                    {service.startingPrice ? (
                      <p className="text-sm font-medium">Starting at {service.startingPrice}</p>
                    ) : null}
                    <ButtonLink variant="cta" href="/#request-service">
                      Request Service
                    </ButtonLink>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
