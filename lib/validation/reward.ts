import { z } from "zod";

export const createRewardSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(60),
  cost: z.coerce
    .number()
    .int("Cost must be a whole number.")
    .positive("Cost must be greater than 0.")
    .max(1000000),
  emoji: z
    .string()
    .trim()
    .max(8)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type CreateRewardInput = z.infer<typeof createRewardSchema>;
