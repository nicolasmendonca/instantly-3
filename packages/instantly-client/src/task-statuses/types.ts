import { z } from "zod";
import {
  taskStatusSchema,
  taskStatusListSchema,
  taskStatusWithoudIdSchema,
} from "./schemas";

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskStatusList = z.infer<typeof taskStatusListSchema>;
export type TaskStatusWithoutId = z.infer<typeof taskStatusWithoudIdSchema>;
