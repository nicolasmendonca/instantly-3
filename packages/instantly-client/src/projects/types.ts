import { z } from "zod";
import { projectSchema, projectWithoutIdSchema } from "./schemas";

export type Project = z.infer<typeof projectSchema>;
export type ProjectWithoutId = z.infer<typeof projectWithoutIdSchema>;
