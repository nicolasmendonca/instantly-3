import { Project, Task, Workspace } from "instantly-client";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
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

type UseTaskReturnType = SWRResponse<Task, any, any> & {
  updateTask: (taskId: Task["id"], task: Task) => Promise<void>;
};

export function useTask(
  { workspaceId, projectId, taskId }: UseTaskParam,
  swrConfig: SWRConfiguration = {}
): UseTaskReturnType {
  const { user } = useAuth();
  const instantlyClient = useInstantlyClient();
  const { data, mutate, ...swr } = useSWR<Task, any, () => UseTaskKey>(
    () => ({
      key: `task`,
      userId: user?.id,
      workspaceId,
      projectId,
      taskId,
    }),
    instantlyClient.getTaskForProject,
    swrConfig
  );

  const updateTask: UseTaskReturnType["updateTask"] = async (
    taskId,
    updatedTask
  ) => {
    await instantlyClient.updateTask(
      { taskId, projectId, workspaceId },
      updatedTask
    );
    await mutate(updatedTask, {
      revalidate: false,
    });
  };

  return { ...swr, data, mutate, updateTask };
}
