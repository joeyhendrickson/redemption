import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-settings";
import { db } from "@/lib/db";

export const metadata = { title: "Services | Redemption Home Services" };

async function getServices() {
  try {
    return await db.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const categories = await getServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Handyman, maintenance, and property services for {settings.serviceArea}. Browse categories below or submit a
          service request for a custom quote.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        {categories.length === 0 ? (
          <p className="text-muted-foreground">Service catalog loading. Run database seed to populate services.</p>
        ) : (
          categories.map((category) => (
            <section key={category.id}>
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              {category.description ? (
                <p className="mt-2 max-w-3xl text-muted-foreground">{category.description}</p>
              ) : null}
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
                      <ButtonLink href="/#request-service" style={{ backgroundColor: settings.accentColor }}>
                        Request Service
                      </ButtonLink>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
