import { generateId } from "../utils/generateId";
import { TaskStatus } from "./types";

export function buildTaskStatusObject(
  taskStatusPayload: Pick<TaskStatus, "label">
): TaskStatus {
  return {
    id: generateId(),
    ...taskStatusPayload,
  };
}
