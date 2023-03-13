import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url(),
});
