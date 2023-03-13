import { z } from "zod";
import { workspaceSchema, workspaceWithoutIdSchema } from "./schemas";

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceWithoutId = z.infer<typeof workspaceWithoutIdSchema>;
