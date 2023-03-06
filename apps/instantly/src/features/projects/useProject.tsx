import useSWR, { SWRResponse } from "swr";
import {
  instantlyClient,
  Project,
  Workspace,
} from "../../clients/instantlyClient";

export const useProject = ({
  workspaceId,
  projectId,
}: {
  projectId: Project["id"];
  workspaceId: Workspace["id"];
}): SWRResponse<Project, any, any> => {
  return useSWR<
    Project,
    any,
    () => ["workspaces", Workspace["id"], "projects", Project["id"]]
  >(
    () => ["workspaces", workspaceId, "projects", projectId],
    ([, workspaceId, , projectId]) =>
      instantlyClient.getProjectForWorkspace({ workspaceId, projectId })
  );
};
