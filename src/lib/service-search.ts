export type ServiceSearchItem = {
  id: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  description?: string | null;
  exampleProjects?: string | null;
};

export function buildServiceSearchItems(
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    services: Array<{
      id: string;
      name: string;
      description?: string | null;
      exampleProjects?: string | null;
    }>;
  }>,
): ServiceSearchItem[] {
  return categories.flatMap((category) =>
    category.services.map((service) => ({
      id: service.id,
      name: service.name,
      categoryName: category.name,
      categorySlug: category.slug,
      description: service.description,
      exampleProjects: service.exampleProjects,
    })),
  );
}

export function findBestServiceMatch(query: string, items: ServiceSearchItem[]) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  let bestItem: ServiceSearchItem | null = null;
  let bestScore = 0;

  for (const item of items) {
    const score = scoreServiceMatch(normalizedQuery, item);
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestScore > 0 ? bestItem : null;
}

function scoreServiceMatch(query: string, item: ServiceSearchItem) {
  const name = item.name.toLowerCase();
  const category = item.categoryName.toLowerCase();
  const description = (item.description ?? "").toLowerCase();
  const examples = (item.exampleProjects ?? "").toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);

  if (name === query) return 1000;
  if (name.startsWith(query)) return 850;
  if (name.includes(query)) return 700;
  if (category === query) return 650;
  if (category.includes(query)) return 500;

  if (terms.length > 1 && terms.every((term) => name.includes(term))) {
    return 600;
  }

  let score = 0;

  for (const term of terms) {
    if (name.includes(term)) score += 120;
    if (category.includes(term)) score += 60;
    if (description.includes(term)) score += 30;
    if (examples.includes(term)) score += 20;
  }

  return score;
}

export function serviceElementId(serviceId: string) {
  return `service-${serviceId}`;
}
