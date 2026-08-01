export type TeamProfile = {
  firstName: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export const TEAM_PROFILES: TeamProfile[] = [
  {
    firstName: "Joe",
    role: "Owner",
    bio: "Joe helps turn your service request into a clear plan—from scoping the work and coordinating timelines to managing billing and making sure projects stay on track start to finish. If your job involves multiple visits, larger repairs, or detailed estimates, Joe is often your main point of contact for setup, updates, and delivery.",
    imageUrl: "/images/team/placeholder-1.svg",
  },
  {
    firstName: "Ryan",
    role: "Service Director",
    bio: "Ryan leads our field services and still performs hands-on repair work across Columbus and Central Ohio. He sets the standard for quality on site, guides how jobs are completed, and makes sure the work matches what was promised. When you need skilled repairs done right, Ryan is directly involved in keeping service dependable and consistent.",
    imageUrl: "/images/team/placeholder-2.svg",
  },
  {
    firstName: "Louis",
    role: "Service Manager",
    bio: "Louis leads day-to-day repair operations and works alongside the team on home repairs. He helps assign the right people to each job, keeps work moving efficiently, and assists on site when needed. Louis is a great resource for scheduling questions, progress updates, and making sure your repair experience stays smooth from arrival through completion.",
    imageUrl: "/images/team/placeholder-3.svg",
  },
];
