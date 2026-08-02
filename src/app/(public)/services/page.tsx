import { ServicesCatalog } from "@/components/public/services-catalog";
import { toDisplayServiceCategories } from "@/data/service-catalog";
import { getSiteSettings } from "@/lib/site-settings";
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
      </div>

      <div className="mt-8">
        <ServicesCatalog categories={categories} fromDatabase={fromDatabase} />
      </div>
    </div>
  );
}
