import useSWR, { preload, SWRResponse } from "swr";
import { Project, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseProjectParams = {
  projectId: Project["id"];
  workspaceId: Workspace["id"];
};

type UseProjectKey = UseProjectParams & {
  key: "project";
};

export function useProject({
  workspaceId,
  projectId,
}: UseProjectParams): SWRResponse<Project, any, any> {
  const instantlyClient = useInstantlyClient();
  return useSWR<Project, any, () => UseProjectKey>(
    () => ({
      key: "project",
      projectId,
      workspaceId,
    }),
    instantlyClient.getProjectForWorkspace
  );
}

export async function preloadProject(
  params: UseProjectParams,
  project: Project
) {
  const key: UseProjectKey = {
    key: "project",
    projectId: params.projectId,
    workspaceId: params.workspaceId,
  };
  await preload(key, () => project);
}
