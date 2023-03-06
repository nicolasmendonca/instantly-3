import useSWR from "swr";
import { instantlyClient, Workspace } from "../../clients/instantlyClient";

export const useWorkspace = ({
  workspaceId,
}: {
  workspaceId: Workspace["id"];
}) => {
  return useSWR<Workspace, any, () => [string, Workspace["id"]]>(
    () => ["workspaces", workspaceId],
    ([, workspaceId]) => instantlyClient.getWorkspace({ workspaceId })
  );
};
