import useSWR, { SWRResponse } from "swr";
import {
  instantlyClient,
  Project,
  Workspace,
} from "../../clients/instantlyClient";

export const useProjects = ({
  workspaceId,
}: {
  workspaceId: Workspace["id"];
}): SWRResponse<Project[], any, any> => {
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
