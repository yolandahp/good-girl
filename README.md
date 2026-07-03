# Be the Good Girl

A personal habit-and-reward tracker: turn daily tasks and habits into points, and
points into real-life rewards. Complete tasks, stay under spending/calorie
budgets, plan your days on a calendar, and redeem what you've earned.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Supabase Auth ·
Postgres + Drizzle ORM · Zod · Vitest

## Getting started

```bash
npm install
cp .env.example .env        # fill in your Supabase values
npm run db:migrate          # apply migrations to your database
npm run dev                 # http://localhost:3000
```

Seed sample data for an existing account:

```bash
SEED_USER_EMAIL=you@example.com npm run db:seed
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` / `start` | Production build / serve |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` / `typecheck` | Lint / type-check |
| `npm run format` | Prettier |
| `npm run db:generate` / `db:migrate` | Create / apply migrations |
| `npm run db:push` / `db:studio` | Push schema / open Drizzle Studio |
| `npm run db:seed` | Seed sample data (`SEED_USER_EMAIL`) |

## Deploy

1. Import the repo on [Vercel](https://vercel.com) and set the env vars from
   `.env` (all except `SEED_USER_EMAIL`).
2. In Supabase → Auth → URL Configuration, set the **Site URL** to your Vercel
   domain.
3. Configure custom SMTP in Supabase for auth emails before real use.
