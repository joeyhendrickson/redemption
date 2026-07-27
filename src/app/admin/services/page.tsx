import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const categories = await db.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { services: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <PortalShell role="ADMIN" title="Services Catalog" userName={`${user.firstName} ${user.lastName}`}>
      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <li key={service.id} className="rounded-md border px-3 py-2 text-sm">
                    {service.name}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
