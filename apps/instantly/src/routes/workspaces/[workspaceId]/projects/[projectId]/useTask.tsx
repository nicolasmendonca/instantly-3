import { Project, Task, User, Workspace } from "instantly-client";
import useSWR, { MutatorOptions, SWRConfiguration, SWRResponse } from "swr";
import { z } from "zod";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseTaskRequiredParam = {
  workspaceId: Workspace["id"];
  projectId: Project["id"];
  taskId: Task["id"];
  userId: User["id"];
};

// We use a Partial since we might need to use conditional fetching if some data is not available
type UseTaskArgument = Partial<UseTaskRequiredParam>;

type UseTaskKey = UseTaskRequiredParam & {
  key: "task";
};

type UseTaskReturnType = SWRResponse<Task, any, any> & {
  updateTask: (
    taskId: Task["id"],
    task: Task,
    mutatorOptions?: MutatorOptions
  ) => Promise<void>;
};

const useTaskKeyValidator = z.object({
  key: z.literal("task").default("task"),
  workspaceId: z.string(),
  projectId: z.string(),
  taskId: z.string(),
  userId: z.string(),
});

export function useTask(
  params: UseTaskArgument,
  swrConfig: SWRConfiguration = {}
): UseTaskReturnType {
  const instantlyClient = useInstantlyClient();
  const { data, mutate, ...swr } = useSWR<Task, any, () => UseTaskKey>(
    () => useTaskKeyValidator.parse(params),
    instantlyClient.getTaskForProject,
    swrConfig
  );

  const updateTask: UseTaskReturnType["updateTask"] = async (
    taskId,
    updatedTask,
    mutatorOptions = {}
  ) => {
    const { projectId, workspaceId } = useTaskKeyValidator.parse(params);
    await mutate(
      async () => {
        await instantlyClient.updateTask(
          { taskId, projectId, workspaceId },
          updatedTask
        );
        return updatedTask;
      },
      {
        optimisticData: updatedTask,
        ...mutatorOptions,
      }
    );
  };

  return { ...swr, data, mutate, updateTask };
}
