import useSWR, { preload, SWRConfiguration, SWRResponse } from "swr";
import { Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseWorkspaceParam = {
  workspaceId: Workspace["id"];
};

type UseWorkspaceKey = UseWorkspaceParam & {
  key: "workspaces";
};

export function useWorkspace(
  { workspaceId }: UseWorkspaceParam,
  swrConfig: SWRConfiguration = {}
): SWRResponse<Workspace, any, any> {
  const instantlyClient = useInstantlyClient();
  return useSWR<Workspace, any, () => UseWorkspaceKey>(
    () => ({
      key: "workspaces",
      workspaceId,
    }),
    instantlyClient.getWorkspace,
    swrConfig
  );
}

export async function preloadWorkspace(
  params: UseWorkspaceParam,
  workspace: Workspace
) {
  const { workspaceId } = params;
  const key: UseWorkspaceKey = {
    key: "workspaces",
    workspaceId,
  };
  await preload(key, () => workspace);
}
