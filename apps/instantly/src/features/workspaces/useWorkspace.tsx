import useSWR from "swr";
import { Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

export const useWorkspace = ({
  workspaceId,
}: {
  workspaceId: Workspace["id"];
}) => {
  const instantlyClient = useInstantlyClient();
  return useSWR<Workspace, any, () => [string, Workspace["id"]]>(
    () => ["workspaces", workspaceId],
    ([, workspaceId]) => instantlyClient.getWorkspace({ workspaceId })
  );
};
