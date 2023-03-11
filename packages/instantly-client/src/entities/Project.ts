import { TaskStatus } from "./TaskStatus";

export type Project = {
  id: string;
  name: string;
  emoji: string;
  defaultTaskStatusId: TaskStatus["id"];
};
