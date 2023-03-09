import { Project, Task, Workspace } from "instantly-client";
import useSWR, { SWRResponse } from "swr";
import { useAuth } from "src/features/auth/AuthProvider";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseTaskParam = {
  workspaceId: Workspace["id"];
  projectId: Project["id"];
  taskId: Task["id"];
};

type UseTaskKey = UseTaskParam & {
  key: "task";
};

export function useTask({
  workspaceId,
  projectId,
  taskId,
}: UseTaskParam): SWRResponse<Task, any, UseTaskKey> {
  const { user } = useAuth();
  const instantlyClient = useInstantlyClient();
  return useSWR<Task, any, () => UseTaskKey>(
    () => ({
      key: `task`,
      userId: user?.id,
      workspaceId,
      projectId,
      taskId,
    }),
    instantlyClient.getTaskForProject
  );
}
