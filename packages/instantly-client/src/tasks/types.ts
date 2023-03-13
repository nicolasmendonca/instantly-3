import { z } from "zod";
import { taskSchema, taskWithoutIdSchema } from "./schemas";

export type Task = z.infer<typeof taskSchema>;
export type TaskWithoutId = z.infer<typeof taskWithoutIdSchema>;
