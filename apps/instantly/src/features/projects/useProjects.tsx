import useSWR, { SWRResponse } from "swr";
import { Project, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

export const useProjects = ({
  workspaceId,
}: {
  workspaceId: Workspace["id"];
}): SWRResponse<Project[], any, any> => {
  const instantlyClient = useInstantlyClient();
  return useSWR<
    Project[],
    any,
    () => ["workspaces", Workspace["id"], "projects"]
  >(
    () => ["workspaces", workspaceId, "projects"],
    ([, workspaceId]) =>
      instantlyClient.getProjectsForWorkspace({ workspaceId })
  );
};
