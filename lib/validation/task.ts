import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  points: z.coerce
    .number()
    .int("Points must be a whole number.")
    .positive("Points must be greater than 0.")
    .max(100000),
  type: z.enum(["oneoff", "repeatable"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
