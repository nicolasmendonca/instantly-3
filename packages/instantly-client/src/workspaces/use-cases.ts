import { InstantlyClient } from "../InstantlyClient";
import { Workspace } from "./types";
import { workspaceSchema } from "./schemas";
import { generateId } from "../utils/generateId";
import { WorkspaceMember } from "../workspace-members";

function generateWorkspaceAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${name.replaceAll(
    " ",
    "+"
  )}&background=0D8ABC&color=fff&rounded=true&bold=true`;
}

export function buildWorkspaceObject(
  workspacePayload: Pick<Workspace, "name" | "userCreatorId">
): Workspace {
  return workspaceSchema.parse({
    id: generateId(),
    avatarUrl: generateWorkspaceAvatar(workspacePayload.name),
    ...workspacePayload,
  });
}

export async function createWorkspace(
  instantlyClient: InstantlyClient,
  params: {
    workspace: Workspace;
    workspaceMember: WorkspaceMember;
  }
): Promise<void> {
  return instantlyClient.createNewWorkspace(params);
}
