import useSWR from "swr";
import { Workspace } from "instantly-client";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

export const useWorkspaceTasks = ({
  workspaceId,
}: {
  workspaceId: Workspace["id"];
}) => {
  const instantlyClient = useInstantlyClient();
  return useSWR(`/api/workspaces/${workspaceId}/tasks`, async () =>
    instantlyClient.getTasksForWorkspace({ workspaceId })
  );
};
