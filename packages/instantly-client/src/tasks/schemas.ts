import { z } from "zod";

export const taskWithoutIdSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.string(),
  archived: z.boolean(),
});

export const taskSchema = taskWithoutIdSchema.extend({
  id: z.string(),
});
