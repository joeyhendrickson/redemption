import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
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

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      primaryColor: "#000000",
      accentColor: "#000000",
    },
    create: {
      id: "default",
      primaryColor: "#000000",
      accentColor: "#000000",
    },
  });

  let categoryOrder = 0;
  for (const category of categories) {
    const createdCategory = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: categoryOrder,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: categoryOrder,
      },
    });

    let serviceOrder = 0;
    for (const serviceName of category.services) {
      const slug = `${category.slug}-${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
      await prisma.service.upsert({
        where: { slug },
        update: {
          name: serviceName,
          description: `Professional ${serviceName.toLowerCase()} for Columbus and Central Ohio homes.`,
          sortOrder: serviceOrder,
          categoryId: createdCategory.id,
        },
        create: {
          name: serviceName,
          slug,
          description: `Professional ${serviceName.toLowerCase()} for Columbus and Central Ohio homes.`,
          exampleProjects: `Residential ${serviceName.toLowerCase()} projects`,
          startingPrice: "Contact for estimate",
          sortOrder: serviceOrder,
          categoryId: createdCategory.id,
        },
      });
      serviceOrder++;
    }
    categoryOrder++;
  }

  const faqs = [
    {
      question: "What areas do you serve?",
      answer:
        "We serve Columbus, Ohio, and the surrounding Central Ohio communities. Contact us to confirm availability for your address.",
    },
    {
      question: "Do you provide emergency services?",
      answer:
        "We are not an emergency service provider. Urgent requests are flagged for immediate review, but for fire, gas leaks, major flooding, or life-threatening situations, call 911.",
    },
    {
      question: "How do I track my request?",
      answer:
        "After submitting a service request, create a free customer account to view status updates, upload photos, message our team, and approve estimates.",
    },
    {
      question: "Can renters submit requests?",
      answer:
        "Yes. Renters may submit requests, but landlord authorization may be required before work begins.",
    },
  ];

  for (const [index, faq] of faqs.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.faq.create({ data: { ...faq, sortOrder: index } });
    }
  }

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Columbus, OH",
      content:
        "Clear communication from start to finish. They repaired drywall and painted the room — it looks brand new.",
      rating: 5,
    },
    {
      name: "David R.",
      location: "Dublin, OH",
      content:
        "Professional, on time, and careful with our rental property. The portal made it easy to approve the estimate.",
      rating: 5,
    },
    {
      name: "Angela T.",
      location: "Westerville, OH",
      content:
        "We use Redemption for our punch-list repairs before listings. Dependable work every time.",
      rating: 5,
    },
    {
      name: "Dr. Fojas",
      location: "Columbus, OH",
      content:
        "They handled our clinic renovation punch list with care and precision. Every detail was documented, and the team communicated clearly from start to finish.",
      rating: 5,
    },
    {
      name: "Sudhir Subey",
      location: "Central Ohio",
      content:
        "Redemption made coordinating maintenance across multiple properties simple. Responsive scheduling, fair pricing, and quality work we could trust.",
      rating: 5,
    },
    {
      name: "Joey Hendrickson",
      location: "Columbus, OH",
      content:
        "I wanted a service company that treats homeowners with respect — clear estimates, honest timelines, and work done right. Redemption delivers on all of it.",
      rating: 5,
    },
    {
      name: "Michael P.",
      location: "Powell, OH",
      content:
        "From ceiling fan installs to exterior repairs, they've been our go-to handyman team. Always professional and easy to reach through the portal.",
      rating: 5,
    },
    {
      name: "Lisa K.",
      location: "New Albany, OH",
      content:
        "They transformed our pre-listing repair list into a smooth process. The before-and-after photos and updates gave us complete confidence.",
      rating: 5,
    },
  ];

  for (const [index, testimonial] of testimonials.entries()) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name, content: testimonial.content },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...testimonial, sortOrder: index } });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
