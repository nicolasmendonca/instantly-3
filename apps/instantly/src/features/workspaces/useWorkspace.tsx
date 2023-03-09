import useSWR, { SWRResponse } from "swr";
import { Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseWorkspaceParam = {
  workspaceId: Workspace["id"];
};

type UseWorkspaceKey = UseWorkspaceParam & {
  key: "workspaces";
};

export function useWorkspace({
  workspaceId,
}: UseWorkspaceParam): SWRResponse<Workspace, any, UseWorkspaceKey> {
  const instantlyClient = useInstantlyClient();
  return useSWR<Workspace, any, () => UseWorkspaceKey>(
    () => ({
      key: "workspaces",
      workspaceId,
    }),
    instantlyClient.getWorkspace
  );
}
