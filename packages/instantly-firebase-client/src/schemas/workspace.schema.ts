import { z } from "zod";

const nameSchema = z.string();
const avatarUrlSchema = z.string().url();
const userCreatorIdSchema = z.string();

export const workspaceWithoutIdSchema = z.object({
  name: nameSchema,
  avatarUrl: avatarUrlSchema,
  userCreatorId: userCreatorIdSchema,
});

export const workspaceSchema = workspaceWithoutIdSchema.extend({
  id: z.string(),
});
