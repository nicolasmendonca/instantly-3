import { z } from "zod";

export const workspaceMemberWithoutIdSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url(),
  role: z.union([z.literal("admin"), z.literal("member"), z.literal("guest")]),
});

export const workspaceMemberSchema = workspaceMemberWithoutIdSchema.extend({
  id: z.string(),
});
