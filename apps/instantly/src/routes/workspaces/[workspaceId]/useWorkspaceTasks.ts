import { Workspace } from "instantly-client";
import useSWR from "swr";
import { instantlyClient } from "src/clients/instantlyClient";

export const useWorkspaceTasks = ({
  workspaceId,
}: {
  workspaceId: Workspace["id"];
}) => {
  return useSWR(`/api/workspaces/${workspaceId}/tasks`, async () =>
    instantlyClient.getTasksForWorkspace({ workspaceId })
  );
};
