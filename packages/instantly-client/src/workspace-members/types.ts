import { z } from "zod";
import { workspaceMemberSchema } from "./schemas";

export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
