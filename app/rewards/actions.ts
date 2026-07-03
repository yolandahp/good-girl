"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { ledger, rewards } from "@/db/schema";
import { type ActionState } from "@/lib/action-state";
import { uuidField } from "@/lib/form";
import { appendLedger } from "@/lib/points/ledger";
import { checkRedeemable } from "@/lib/points/redeem";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createRewardSchema } from "@/lib/validation/reward";

export async function createReward(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = createRewardSchema.safeParse({
    name: formData.get("name"),
    cost: formData.get("cost"),
    emoji: formData.get("emoji"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid reward." };
  }

  await db.insert(rewards).values({ userId: user.id, ...parsed.data });

  revalidatePath("/rewards");
  return {};
}

export async function editReward(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const rewardId = uuidField(formData, "rewardId");
  if (!rewardId) return { error: "Reward not found." };

  const parsed = createRewardSchema.safeParse({
    name: formData.get("name"),
    cost: formData.get("cost"),
    emoji: formData.get("emoji"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid reward." };
  }

  await db
    .update(rewards)
    .set(parsed.data)
    .where(and(eq(rewards.id, rewardId), eq(rewards.userId, user.id)));

  revalidatePath("/rewards");
  return {};
}

export async function deleteReward(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const rewardId = uuidField(formData, "rewardId");
  if (!rewardId) return { error: "Reward not found." };

  // Any redemption ledger row is kept, so spent points stay spent.
  await db
    .delete(rewards)
    .where(and(eq(rewards.id, rewardId), eq(rewards.userId, user.id)));

  revalidatePath("/rewards");
  return {};
}

export async function redeemReward(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const rewardId = uuidField(formData, "rewardId");
  if (!rewardId) return { error: "Reward not found." };

  const result = await db.transaction(async (tx) => {
    // Serialize redemptions per user so two concurrent redeems can't both pass
    // the balance check and overspend. Released at transaction end.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);

    const [reward] = await tx
      .select()
      .from(rewards)
      .where(and(eq(rewards.id, rewardId), eq(rewards.userId, user.id)));
    if (!reward) return { error: "Reward not found." };

    const [row] = await tx
      .select({ balance: sql<string>`coalesce(sum(${ledger.delta}), 0)` })
      .from(ledger)
      .where(eq(ledger.userId, user.id));
    const balance = Number(row?.balance ?? 0);

    const check = checkRedeemable(balance, reward);
    if (!check.ok) return { error: check.reason };

    const entry = await appendLedger(tx, {
      userId: user.id,
      delta: -reward.cost,
      source: "redeem",
      refId: reward.id,
      note: reward.name,
    });
    // Unique(source, ref_id) already had this redemption — treat as redeemed.
    if (!entry) return { error: "Already redeemed." };

    await tx
      .update(rewards)
      .set({ redeemedAt: new Date() })
      .where(eq(rewards.id, reward.id));

    return {};
  });

  revalidatePath("/rewards");
  revalidatePath("/dashboard");
  return result;
}
