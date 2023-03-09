import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { Project, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseProjectsParam = {
  workspaceId: Workspace["id"];
};

export function useProjects(
  { workspaceId }: UseProjectsParam,
  swrConfig: SWRConfiguration = {}
): SWRResponse<Project[], any, any> {
  const instantlyClient = useInstantlyClient();
  return useSWR<
    Project[],
    any,
    () => UseProjectsParam & {
      key: `/workspaces/${Workspace["id"]}/projects`;
    }
  >(
    () => ({
      key: `/workspaces/${workspaceId}/projects`,
      workspaceId,
    }),
    instantlyClient.getProjectsForWorkspace,
    swrConfig
  );
}
