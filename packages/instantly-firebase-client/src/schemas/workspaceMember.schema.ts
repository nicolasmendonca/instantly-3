import { z } from "zod";

// This is the only admited role for now
const roleSchema = z.literal("admin");
const avatarUrlSchema = z.string().url();
const nameSchema = z.string();

export const workspaceMemberWithoutIdSchema = z.object({
  role: roleSchema,
  avatarUrl: avatarUrlSchema,
  name: nameSchema.default("Anon"),
});

export const workspaceMemberSchema = workspaceMemberWithoutIdSchema.extend({
  id: z.string(),
});
