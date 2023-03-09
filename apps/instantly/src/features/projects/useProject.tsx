import useSWR, { SWRResponse } from "swr";
import { Project, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseProjectParams = {
  projectId: Project["id"];
  workspaceId: Workspace["id"];
};

export function useProject({
  workspaceId,
  projectId,
}: UseProjectParams): SWRResponse<Project, any, any> {
  const instantlyClient = useInstantlyClient();
  return useSWR<
    Project,
    any,
    () => UseProjectParams & {
      key: `/workspaces/${Workspace["id"]}/projects/${Project["id"]}`;
    }
  >(
    () => ({
      projectId,
      workspaceId,
      key: `/workspaces/${workspaceId}/projects/${projectId}`,
    }),
    instantlyClient.getProjectForWorkspace
  );
}
