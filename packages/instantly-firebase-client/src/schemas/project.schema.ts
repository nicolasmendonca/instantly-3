import { z } from "zod";

export const projectWithoutIdSchema = z.object({
  name: z.string(),
  emoji: z.string(),
  defaultTaskStatusId: z.string(),
});

export const projectSchema = projectWithoutIdSchema.extend({
  id: z.string(),
});
