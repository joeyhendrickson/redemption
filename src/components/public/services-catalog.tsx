"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ServiceCategoryArt } from "@/components/graphics/service-category-art";
import {
  buildServiceSearchItems,
  findBestServiceMatch,
  serviceElementId,
} from "@/lib/service-search";
import { getServiceGraphicVariant } from "@/lib/service-graphics";

export type ServicesCatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  services: Array<{
    id: string;
    name: string;
    description?: string | null;
    exampleProjects?: string | null;
    startingPrice?: string | null;
  }>;
};

export function ServicesCatalog({
  categories,
  fromDatabase,
}: {
  categories: ServicesCatalogCategory[];
  fromDatabase: boolean;
}) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const searchItems = buildServiceSearchItems(categories);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (highlightTimeoutRef.current) window.clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  function clearHighlight() {
    setHighlightedServiceId(null);
  }

  function scrollToService(serviceId: string) {
    const element = document.getElementById(serviceElementId(serviceId));
    if (!element) {
      setMessage("We couldn't locate that service on the page. Try another search.");
      clearHighlight();
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedServiceId(serviceId);
    setMessage(null);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      clearHighlight();
    }, 2400);
  }

  function runSearch(rawQuery: string) {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      setMessage(null);
      clearHighlight();
      return;
    }

    const match = findBestServiceMatch(trimmed, searchItems);
    if (!match) {
      setMessage(`No services matched "${trimmed}". Try a shorter phrase like "drywall" or "ceiling fan".`);
      clearHighlight();
      return;
    }

    scrollToService(match.id);
  }

  function handleChange(value: string) {
    setQuery(value);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setMessage(null);
      clearHighlight();
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      runSearch(value);
    }, 350);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    runSearch(query);
  }

  return (
    <>
      <div className="sticky top-16 z-40 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <label htmlFor="services-search" className="sr-only">
            Search services
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="services-search"
              type="search"
              value={query}
              onChange={(event) => handleChange(event.target.value)}
              placeholder="Search services (e.g. drywall, ceiling fan, plumbing)"
              className="h-11 pl-9"
              autoComplete="off"
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Start typing and we&apos;ll scroll to the closest matching service.
          </p>
          {message ? <p className="mt-2 text-sm text-destructive">{message}</p> : null}
        </form>
      </div>

      {!fromDatabase ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Showing the full service catalog. Connect your database and run{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">npm run db:seed</code> to sync admin-managed services.
        </p>
      ) : null}

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
              {category.services.map((service) => {
                const isHighlighted = highlightedServiceId === service.id;

                return (
                  <div
                    key={service.id}
                    id={serviceElementId(service.id)}
                    className={`scroll-mt-28 rounded-xl transition-shadow duration-300 ${
                      isHighlighted ? "ring-2 ring-gold shadow-md" : ""
                    }`}
                  >
                    <Card className="h-full">
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
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
