import useSWR, { SWRResponse } from "swr";
import {
  Project,
  TaskStatus,
  Workspace,
} from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseTaskStatusesParams = {
  projectId: Project["id"];
  workspaceId: Workspace["id"];
};

export function useTaskStatuses({
  workspaceId,
  projectId,
}: UseTaskStatusesParams): SWRResponse<TaskStatus[], any, any> {
  const instantlyClient = useInstantlyClient();
  return useSWR<
    TaskStatus[],
    any,
    () => UseTaskStatusesParams & {
      key: `task-statuses`;
    }
  >(
    () => ({
      projectId,
      workspaceId,
      key: `task-statuses`,
    }),
    instantlyClient.getTaskStatuses
  );
}
