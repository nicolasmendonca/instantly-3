import { InstantlyClient } from "../InstantlyClient";
import { Project } from "../projects";
import { Workspace } from "../workspaces";
import { taskSchema } from "./schemas";
import { Task } from "./types";

export function createTask(
  instantlyClient: InstantlyClient,
  {
    task,
    workspaceId,
    projectId,
  }: {
    task: Task;
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }
): Promise<void> {
  return instantlyClient.createTask(
    {
      workspaceId,
      projectId,
    },
    taskSchema.parse(task)
  );
}
