import useSWR, { SWRResponse } from "swr";
import { Project, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

export const useProject = ({
  workspaceId,
  projectId,
}: {
  projectId: Project["id"];
  workspaceId: Workspace["id"];
}): SWRResponse<Project, any, any> => {
  const instantlyClient = useInstantlyClient();
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
