import { InstantlyClient } from "../InstantlyClient";
import { TaskStatus, taskStatusListSchema } from "../task-statuses";
import { generateId } from "../utils/generateId";
import { Workspace } from "../workspaces";
import { projectSchema } from "./schemas";
import { Project } from "./types";

export function buildProjectObject(
  projectPayload: Pick<Project, "defaultTaskStatusId" | "name">
): Project {
  return {
    id: generateId(),
    emoji: "📝",
    ...projectPayload,
  };
}

export async function createProject(
  instantlyClient: InstantlyClient,
  {
    project,
    taskStatuses,
    workspaceId,
  }: {
    project: Project;
    taskStatuses: TaskStatus[];
    workspaceId: Workspace["id"];
  }
): Promise<void> {
  return instantlyClient.createProject({
    project: projectSchema.parse(project),
    taskStatuses: taskStatusListSchema.parse(taskStatuses),
    workspaceId,
  });
}
