import Image from "next/image";
import { TEAM_PROFILES } from "@/data/team-profiles";
import { Card, CardContent } from "@/components/ui/card";

export function TeamProfilesSection() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Our Team</h2>
      <p className="mt-3 text-muted-foreground">
        Meet the people behind Redemption Home Services.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_PROFILES.map((member) => (
          <Card key={member.firstName} className="overflow-hidden pt-0">
            <div className="relative aspect-[4/5] w-full bg-muted">
              <Image
                src={member.imageUrl}
                alt={`${member.firstName} profile photo placeholder`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <CardContent className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold">{member.firstName}</h3>
                <p className="text-sm text-gold">{member.role}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
