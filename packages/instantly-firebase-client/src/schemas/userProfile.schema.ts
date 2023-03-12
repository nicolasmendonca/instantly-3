import { z } from "zod";

export const userProfileWithoutIdSchema = z.object({
  name: z.string(),
  avatarUrl: z.string().url(),
});

export const userProfileSchema = userProfileWithoutIdSchema.extend({
  id: z.string(),
});
