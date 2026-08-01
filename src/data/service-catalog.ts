export type ServiceCatalogCategory = {
  name: string;
  slug: string;
  description: string;
  services: string[];
};

export const SERVICE_CATALOG: ServiceCatalogCategory[] = [
  {
    name: "General Handyman",
    slug: "general-handyman",
    description: "Everyday repairs, installations, and honey-do list projects.",
    services: [
      "General home repairs",
      "Honey-do lists",
      "Furniture assembly",
      "TV mounting",
      "Shelf installation",
      "Picture and mirror hanging",
      "Ceiling fan installation",
      "Door adjustments",
      "Cabinet hardware installation",
      "Mailbox installation",
      "Weatherstripping",
      "Baby-proofing",
      "Senior home safety modifications",
    ],
  },
  {
    name: "Carpentry",
    slug: "carpentry",
    description: "Trim, doors, decks, fences, and custom woodwork.",
    services: [
      "Trim installation",
      "Crown molding",
      "Baseboards",
      "Interior doors",
      "Exterior doors",
      "Door repair",
      "Deck repair",
      "Fence repair",
      "Custom shelving",
      "Closet organization systems",
      "Wood rot repair",
    ],
  },
  {
    name: "Drywall & Painting",
    slug: "drywall-painting",
    description: "Patching, texture matching, and interior/exterior painting.",
    services: [
      "Drywall patching",
      "Hole repair",
      "Texture matching",
      "Interior painting",
      "Exterior painting",
      "Trim painting",
      "Cabinet painting",
      "Touch-up painting",
      "Caulking",
      "Popcorn ceiling repair",
    ],
  },
  {
    name: "Flooring",
    slug: "flooring",
    description: "Repairs and installation for common residential flooring.",
    services: [
      "LVP installation",
      "Laminate flooring",
      "Hardwood repair",
      "Tile replacement",
      "Grout repair",
      "Baseboard installation",
      "Floor transitions",
    ],
  },
  {
    name: "Kitchen & Bathroom",
    slug: "kitchen-bathroom",
    description: "Fixture replacements and minor kitchen and bath updates.",
    services: [
      "Faucet replacement",
      "Garbage disposal replacement",
      "Sink installation",
      "Toilet repair",
      "Toilet replacement",
      "Vanity installation",
      "Bathroom hardware",
      "Shower door installation",
      "Backsplash installation",
      "Cabinet installation",
    ],
  },
  {
    name: "Electrical (Handyman Scope)",
    slug: "electrical",
    description: "Non-permitted fixture replacements and smart device installs.",
    services: [
      "Light fixture replacement",
      "Ceiling fan installation",
      "Switch replacement",
      "Outlet replacement",
      "GFCI installation",
      "Smart switch installation",
      "Smart thermostat installation",
      "Smoke detector replacement",
      "Ring doorbell installation",
      "Security camera installation",
    ],
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    description: "Minor plumbing repairs within handyman scope.",
    services: [
      "Faucet leaks",
      "Toilet repairs",
      "Garbage disposal troubleshooting",
      "Drain replacement",
      "Shower head installation",
      "Hose bib replacement",
      "Minor plumbing repairs",
    ],
  },
  {
    name: "HVAC Services",
    slug: "hvac",
    description: "Basic troubleshooting, maintenance, and thermostat services.",
    services: [
      "A/C troubleshooting",
      "Basic A/C repair",
      "Thermostat replacement",
      "Smart thermostat installation",
      "Air filter replacement",
      "Furnace troubleshooting",
      "Vent replacement",
      "Preventative HVAC maintenance",
      "Condenser cleaning",
      "Airflow diagnostics",
    ],
  },
  {
    name: "Home Security",
    slug: "home-security",
    description: "Locks, smart locks, and security hardware upgrades.",
    services: [
      "Lock repair",
      "Deadbolt installation",
      "Smart lock installation",
      "Door closer installation",
      "Security camera installation",
      "Video doorbell installation",
      "Keypad lock installation",
      "Home security hardware upgrades",
    ],
  },
  {
    name: "Window Treatments",
    slug: "window-treatments",
    description: "Curtain, blind, shade, and shutter installation.",
    services: [
      "Curtain installation",
      "Curtain rod installation",
      "Blinds installation",
      "Shades installation",
      "Plantation shutter installation",
      "Window hardware repair",
    ],
  },
  {
    name: "Outdoor Services",
    slug: "outdoor-services",
    description: "Exterior cleaning, caulking, and minor repairs.",
    services: [
      "Pressure washing",
      "House washing",
      "Driveway cleaning",
      "Sidewalk cleaning",
      "Patio cleaning",
      "Deck cleaning",
      "Fence washing",
      "Gutter cleaning",
      "Downspout cleaning",
      "Exterior caulking",
      "Exterior trim repair",
    ],
  },
  {
    name: "Lawn & Property Maintenance",
    slug: "lawn-property",
    description: "Yard cleanup, trimming, and storm debris removal.",
    services: [
      "Overgrown lawn cleanup",
      "Brush removal",
      "Yard cleanup",
      "Mulching",
      "Weed removal",
      "Shrub trimming",
      "Hedge trimming",
      "Leaf cleanup",
      "Small tree trimming",
      "Storm debris cleanup",
      "Property cleanouts",
    ],
  },
  {
    name: "Hot Tub Services",
    slug: "hot-tub",
    description: "Moving, installation, and site preparation assistance.",
    services: [
      "Hot tub moving",
      "Hot tub relocation",
      "Hot tub installation",
      "Hot tub removal",
      "Spa pad preparation",
      "Electrical coordination",
      "Delivery coordination",
      "Hot tub site preparation",
      "Hot tub cover installation",
      "Hot tub maintenance assistance",
    ],
  },
  {
    name: "Assembly & Installation",
    slug: "assembly-installation",
    description: "Large item assembly and outdoor structure setup.",
    services: [
      "Gazebo assembly",
      "Pergola assembly",
      "Playset assembly",
      "Basketball hoop installation",
      "Grill assembly",
      "Shed assembly",
      "Closet systems",
      "Garage storage systems",
      "Storage racks",
      "Fitness equipment assembly",
    ],
  },
  {
    name: "Smart Home",
    slug: "smart-home",
    description: "Smart device setup and home automation installs.",
    services: [
      "Smart locks",
      "Smart thermostats",
      "Smart lighting",
      "Smart garage door openers",
      "Wi-Fi device setup",
      "Home automation installation",
      "Security camera systems",
      "Smart doorbells",
    ],
  },
  {
    name: "Seasonal Services",
    slug: "seasonal",
    description: "Seasonal maintenance and holiday lighting services.",
    services: [
      "Holiday lighting installation",
      "Holiday lighting removal",
      "Winterization",
      "Spring home maintenance",
      "Fall maintenance",
      "Storm preparation",
      "Ice dam prevention",
      "Weather sealing",
    ],
  },
  {
    name: "Property Services",
    slug: "property-services",
    description: "Rental, turnover, punch-list, and investor property work.",
    services: [
      "Rental property maintenance",
      "Airbnb turnover repairs",
      "Move-in repairs",
      "Move-out repairs",
      "Real estate punch lists",
      "Home inspection repairs",
      "Property preservation",
      "Investor property maintenance",
    ],
  },
  {
    name: "Emergency Services",
    slug: "emergency-services",
    description: "Same-day and urgent repair assistance when available.",
    services: [
      "Emergency home repairs",
      "Storm damage response",
      "Broken door repair",
      "Lock replacement",
      "Water damage mitigation assistance",
      "Temporary board-up services",
      "Same-day handyman service",
    ],
  },
];
;


export type DisplayService = {
  id: string;
  name: string;
  description: string;
  exampleProjects: string | null;
  startingPrice: string | null;
};

export type DisplayServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  services: DisplayService[];
};

function serviceSlug(categorySlug: string, serviceName: string) {
  return `${categorySlug}-${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export function toDisplayServiceCategories(
  catalog: ServiceCatalogCategory[] = SERVICE_CATALOG,
): DisplayServiceCategory[] {
  return catalog.map((category) => ({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    description: category.description,
    services: category.services.map((serviceName) => {
      const slug = serviceSlug(category.slug, serviceName);
      return {
        id: slug,
        name: serviceName,
        description: `Professional ${serviceName.toLowerCase()} for Columbus and Central Ohio homes.`,
        exampleProjects: `Residential ${serviceName.toLowerCase()} projects`,
        startingPrice: "Contact for estimate",
      };
    }),
  }));
}
