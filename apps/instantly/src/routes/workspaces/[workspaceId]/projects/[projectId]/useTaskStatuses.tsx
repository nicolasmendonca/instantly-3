import useSWR, { preload, SWRResponse } from "swr";
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

type UseTaskStatusesKey = UseTaskStatusesParams & {
  key: "task-statuses";
};

export function useTaskStatuses({
  workspaceId,
  projectId,
}: UseTaskStatusesParams): SWRResponse<TaskStatus[], any, UseTaskStatusesKey> {
  const instantlyClient = useInstantlyClient();
  return useSWR<TaskStatus[], any, () => UseTaskStatusesKey>(
    () => ({
      projectId,
      workspaceId,
      key: "task-statuses",
    }),
    instantlyClient.getTaskStatuses
  );
}

export async function preloadTaskStatuses(
  params: UseTaskStatusesParams,
  value: TaskStatus[]
) {
  const key: UseTaskStatusesKey = {
    key: "task-statuses",
    projectId: params.projectId,
    workspaceId: params.workspaceId,
  };
  await preload(key, () => value);
}
