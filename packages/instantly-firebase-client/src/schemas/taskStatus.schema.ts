import { z } from "zod";

export const taskStatusWithoudIdSchema = z.object({
  label: z.string(),
});

export const taskStatusSchema = taskStatusWithoudIdSchema.extend({
  id: z.string(),
});
