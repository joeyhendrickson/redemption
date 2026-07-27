import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Hammer,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceRequestForm } from "@/components/forms/service-request-form";
import { getSiteSettings } from "@/lib/site-settings";
import { db } from "@/lib/db";

async function getHomeData() {
  try {
    const [categories, testimonials, faqs] = await Promise.all([
      db.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
      db.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
      db.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    ]);
    return { categories, testimonials, faqs };
  } catch {
    return {
      categories: [
        { name: "General Handyman", slug: "general-handyman" },
        { name: "Drywall & Painting", slug: "drywall-painting" },
        { name: "Plumbing", slug: "plumbing" },
        { name: "Property Services", slug: "property-services" },
      ],
      testimonials: [
        {
          name: "Sarah M.",
          location: "Columbus, OH",
          content: "Clear communication from start to finish. They repaired drywall and painted the room — it looks brand new.",
          rating: 5,
        },
      ],
      faqs: [
        {
          question: "What areas do you serve?",
          answer: "We serve Columbus, Ohio, and the surrounding Central Ohio communities.",
        },
      ],
    };
  }
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const { categories, testimonials, faqs } = await getHomeData();

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  return (
    <div>
      <section
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-white/80">Columbus & Central Ohio</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{settings.companyName}</h1>
            <p className="text-lg text-white/90">{settings.tagline}</p>
            <p className="max-w-xl text-white/80">
              From honey-do lists to rental punch lists, we deliver dependable handyman and property-maintenance
              services with clear communication at every step.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink size="lg" variant="secondary" href="#request-service">
                Request Service
              </ButtonLink>
              <ButtonLink
                size="lg"
                variant="outline"
                href="/login"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Customer Login
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Trustworthy team", text: "Professional standards and respectful service." },
              { icon: CalendarCheck, title: "Clear scheduling", text: "Appointment updates through your portal." },
              { icon: Wrench, title: "Skilled repairs", text: "Handyman, maintenance, and property services." },
              { icon: ClipboardList, title: "Documented work", text: "Photos, notes, and progress you can follow." },
            ].map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/10 text-white backdrop-blur">
                <CardHeader className="pb-2">
                  <item.icon className="mb-2 h-6 w-6" />
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/80">{item.text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <ServiceRequestForm categories={categoryOptions} accentColor={settings.accentColor} />
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">How it works</h2>
              <ol className="mt-4 space-y-4">
                {[
                  "Submit your service request with photos and details.",
                  "Our team reviews the request and prepares an estimate if needed.",
                  "Approve the estimate and schedule your appointment.",
                  "Track progress, communicate, and review completed work in your portal.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {index + 1}
                    </span>
                    <span className="pt-1 text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border bg-muted/20 p-6">
              <h3 className="font-semibold">Service area</h3>
              <p className="mt-2 text-sm text-muted-foreground">{settings.serviceArea}</p>
              <p className="mt-4 text-sm text-muted-foreground">{settings.emergencyDisclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">Popular services</h2>
              <p className="mt-2 text-muted-foreground">Repairs, maintenance, and property support across Central Ohio.</p>
            </div>
            <ButtonLink variant="outline" href="/services">
              View all services <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.slug ?? category.name}>
                <CardHeader>
                  <Hammer className="mb-2 h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ButtonLink variant="link" className="px-0" href="/services">
                    Learn more
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold">What customers say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={`${testimonial.name}-${testimonial.content.slice(0, 20)}`}>
              <CardContent className="pt-6">
                <div className="mb-3 flex gap-1 text-amber-500">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
                <p className="mt-4 text-sm font-medium">{testimonial.name}</p>
                {"location" in testimonial && testimonial.location ? (
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-lg border px-4 py-3">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
