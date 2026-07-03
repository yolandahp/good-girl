import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { client, db } from "./client";
import {
  budgets,
  budgetLogs,
  budgetSettlements,
  ledger,
  rewards,
  tasks,
} from "./schema";

/**
 * Seeds sample tasks, budgets, and rewards for local development.
 *
 * Rows are owned by a real Supabase auth user, so set SEED_USER_EMAIL to the
 * email of an account you've already signed up. Run with `npm run db:seed`.
 * Re-running wipes and re-inserts this user's rows (idempotent).
 */
async function main() {
  const email = process.env.SEED_USER_EMAIL;
  if (!email) {
    throw new Error(
      "Set SEED_USER_EMAIL to an existing account's email, e.g. SEED_USER_EMAIL=me@example.com npm run db:seed",
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  // Find the auth user by email (dev-scale: first page is plenty).
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email === email);
  if (!user) {
    throw new Error(`No auth user found for ${email}. Sign up first, then seed.`);
  }
  const userId = user.id;

  // Wipe + re-insert atomically so a mid-run failure can't leave data cleared.
  await db.transaction(async (tx) => {
    // Clear this user's existing rows (respect FK order).
    await tx
      .delete(budgetSettlements)
      .where(eq(budgetSettlements.userId, userId));
    await tx.delete(budgetLogs).where(eq(budgetLogs.userId, userId));
    await tx.delete(ledger).where(eq(ledger.userId, userId));
    await tx.delete(budgets).where(eq(budgets.userId, userId));
    await tx.delete(tasks).where(eq(tasks.userId, userId));
    await tx.delete(rewards).where(eq(rewards.userId, userId));

    await tx.insert(tasks).values([
      { userId, title: "Build & deploy app A", points: 25, type: "oneoff" },
      { userId, title: "Morning run", points: 10, type: "repeatable" },
      { userId, title: "Read 20 pages", points: 8, type: "repeatable" },
      { userId, title: "Clear inbox", points: 12, type: "repeatable" },
      { userId, title: "File taxes", points: 40, type: "oneoff" },
    ]);

    await tx.insert(budgets).values([
      {
        userId,
        name: "Spending",
        unit: "$",
        period: "monthly",
        periodLimit: "1000",
        dailyLimit: "30",
        rewardPoints: 50,
      },
      {
        userId,
        name: "Calories",
        unit: "kcal",
        period: "weekly",
        periodLimit: "9000",
        dailyLimit: "1200",
        rewardPoints: 30,
      },
    ]);

    await tx.insert(rewards).values([
      { userId, name: "New ring", cost: 100, emoji: "💍" },
      { userId, name: "Bubble tea", cost: 20, emoji: "🧋" },
      { userId, name: "Movie night", cost: 60, emoji: "🎬" },
      { userId, name: "New sneakers", cost: 300, emoji: "👟" },
      { userId, name: "Fancy dinner", cost: 250, emoji: "🍽️" },
      { userId, name: "Spa day", cost: 400, emoji: "💆" },
    ]);
  });

  console.log(`Seeded 5 tasks, 2 budgets, 6 rewards for ${email}.`);
}

main()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err instanceof Error ? err.message : err);
    await client.end();
    process.exit(1);
  });
