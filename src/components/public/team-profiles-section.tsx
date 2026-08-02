import Image from "next/image";
import Link from "next/link";
import { TEAM_PROFILES } from "@/data/team-profiles";
import { Card, CardContent } from "@/components/ui/card";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function TeamProfilesSection() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Our Team</h2>
      <p className="mt-3 text-muted-foreground">
        Meet the people behind Redemption Home Services.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_PROFILES.map((member) => {
          const photo = (
            <>
              <Image
                src={member.imageUrl}
                alt={`${member.firstName} profile photo`}
                fill
                className="object-contain object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {member.linkedinUrl ? (
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
                  <LinkedInIcon className="h-3.5 w-3.5" />
                  LinkedIn
                </span>
              ) : null}
            </>
          );

          return (
            <Card key={member.firstName} className="overflow-hidden pt-0">
              <div className="relative aspect-[4/5] w-full bg-black">
                {member.linkedinUrl ? (
                  <Link
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group absolute inset-0 block"
                    aria-label={`${member.firstName} on LinkedIn`}
                  >
                    {photo}
                    <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                  </Link>
                ) : (
                  photo
                )}
              </div>
            <CardContent className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold">{member.firstName}</h3>
                <p className="text-sm text-gold">{member.role}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </section>
  );
}
