import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SERVICE_CATALOG } from "../src/data/service-catalog";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      primaryColor: "#000000",
      accentColor: "#C9A227",
      emergencyDisclaimer: "",
      phone: "(614) 747-1926",
      businessHours: "Mon-Fri 3pm-9pm, Sat-Sun 9am-9pm",
      tagline: "Homes repaired, fixed, and redeemed with care.",
      aboutStory:
        "Redemption Home Services was founded on a simple conviction: every home is worth caring for, and every neighbor deserves to be treated with dignity. Our name reflects what we believe restoration should look like—not merely fixing what is broken, but renewing peace, order, and confidence in the places where families live, work, and gather.\n\nWe began serving Columbus and Central Ohio because this is our community. The homes here hold stories, memories, and responsibility. We do not take that lightly. Whether we are repairing a rental between tenants or helping a longtime homeowner with a punch list, we approach each job as stewards—entrusted with someone else's space and called to leave it better than we found it.\n\nThat spirit of service guides everything we do. We are grateful for the trust our neighbors place in us, and we work each day to earn it again.",
      mission:
        "To restore homes and renew trust—serving our neighbors with skilled work, honest communication, and a heart for what is right.",
      values:
        "Stewardship — We treat every property as a sacred trust, caring for it as if it were our own.\n\nIntegrity — We speak truthfully, quote fairly, and keep our word—even when it is inconvenient.\n\nHumility — We listen first, admit when we do not know, and pursue the right solution, not the easiest one.\n\nCompassion — We remember that home problems carry real stress, and we respond with patience, respect, and kindness.\n\nExcellence — We pursue quality not for applause, but because worthy work honors the people we serve.",
      servicePhilosophy:
        "We believe good service begins with presence: showing up when promised, treating people with dignity, and working as if every home matters—because it does. We listen before we recommend, explain options in plain language, and never pressure a homeowner into work they do not need.\n\nWe protect your property while we work, communicate proactively if plans change, and leave every space cleaner than we found it. Our goal is not only to fix what is broken, but to bring peace of mind back to the household. Every visit is an opportunity to serve—to do good work with a good spirit, and to treat our neighbors the way we would want to be treated.",
      professionalStandards:
        "We arrive on time, prepared, and ready to work. Our team communicates clearly from estimate through completion, documents work thoroughly, and stands behind our craftsmanship. We follow safety practices, respect your home and schedule, and address concerns promptly and honestly.\n\nWe hold ourselves to a standard of character as well as skill—because how the work is done matters as much as the result. Dependability, transparency, and respect are not extras on our checklist; they are the foundation of every job we take on.",
      serviceArea: "Columbus and Central Ohio",
    },
    create: {
      id: "default",
      primaryColor: "#000000",
      accentColor: "#C9A227",
      phone: "(614) 747-1926",
    },
  });

  let categoryOrder = 0;
  for (const category of SERVICE_CATALOG) {
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
      question: "How quickly will I hear back after I submit a request?",
      answer:
        "Most requests receive an initial response within one business day. Emergency Review requests are prioritized for faster review, but response times can vary based on request volume and project details.",
    },
    {
      question: "When will my service be scheduled?",
      answer:
        "Scheduling begins after we review your request and confirm scope. We work with you to find an appointment that fits your availability and our service hours. Larger projects may require a brief assessment or estimate visit before the main work is scheduled.",
    },
    {
      question: "How long does a typical repair visit take?",
      answer:
        "Timing depends on the type of work. Small repairs may be completed in a single visit of one to three hours. Larger or multi-part projects may require multiple visits. We provide a clearer time estimate once we review your request and, when needed, prepare a formal estimate.",
    },
    {
      question: "What are your service hours?",
      answer:
        "Our regular service hours are Mon–Fri 3pm–9pm and Sat–Sun 9am–9pm. Actual appointment availability may vary by day, technician schedule, and project type.",
    },
    {
      question: "Do you offer same-day service?",
      answer:
        "Same-day service is not guaranteed. We do our best to accommodate urgent needs when scheduling allows. Selecting Emergency Review flags your request for priority review but does not guarantee same-day arrival unless we confirm it directly with you.",
    },
    {
      question: "Do you provide emergency services?",
      answer:
        "Urgent requests can be flagged as Emergency Review for priority follow-up. This does not guarantee emergency or same-day service. For active safety emergencies, contact appropriate emergency services immediately.",
    },
    {
      question: "How do I track my request?",
      answer:
        "After submitting a service request, create a free customer account to view status updates, upload photos, message our team, and approve estimates.",
    },
  ];

  for (const [index, faq] of faqs.entries()) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: { ...faq, sortOrder: index, isActive: true },
      });
    } else {
      await prisma.faq.create({ data: { ...faq, sortOrder: index } });
    }
  }

  await prisma.faq.updateMany({
    where: { question: "Can renters submit requests?" },
    data: { isActive: false },
  });

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
