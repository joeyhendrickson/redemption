# Redemption Home Services

Production-ready home services marketing site and operations platform for **Redemption Home Services** — handyman and property-maintenance services in Columbus and Central Ohio.

## Features

- **Public website** — Home, Services, About, Contact, legal pages
- **Service request intake** — Multi-step form with conditional questions, file uploads, and emergency safety messaging
- **Customer portal** — Requests, jobs, progress tracking, messages
- **Contractor portal** — Mobile-friendly assigned jobs, tasks, schedule
- **Admin portal** — Requests, jobs, users, services catalog, site settings, analytics
- **Editable branding** — Company name, colors, contact info, about content via admin settings (no code changes)
- **Workflow model** — Service requests, estimates, jobs, tasks, appointments, messages, files, notes, invoices, reviews, audit logs

## Stack

- Next.js 16 (App Router) + TypeScript + React 19
- Tailwind CSS v4 + shadcn/ui
- PostgreSQL + Prisma ORM
- Supabase Auth + storage-ready architecture
- Resend email (configurable)
- Recharts analytics

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Configure `DATABASE_URL`, Supabase keys, and optional `RESEND_API_KEY`.

3. Install dependencies and set up the database:

```bash
npm install
npm run db:push
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Creating users

- **Customers** register after submitting a service request or via `/register`
- **Admins / contractors** are created in Supabase Auth, then linked in the `User` table with role `ADMIN` or `CONTRACTOR`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed services, FAQs, testimonials, site settings |

## Repository

Backup: [github.com/joeyhendrickson/redemption](https://github.com/joeyhendrickson/redemption)
