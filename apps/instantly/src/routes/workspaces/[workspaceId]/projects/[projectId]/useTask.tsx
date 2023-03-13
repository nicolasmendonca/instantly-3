import { Project, Task, User, Workspace } from "instantly-core";
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
  updateTask: (task: Task) => Promise<void>;
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
  const swr = useSWR<Task, any, () => UseTaskKey>(
    // We use a validator here since we might need to use conditional fetching if some data is not available
    // So we throw an error if some data is not loaded and avoid loading
    () => useTaskKeyValidator.parse(params),
    instantlyClient.getTaskForProject,
    swrConfig
  );

  async function optimisticMutate(...args: Parameters<typeof swr.mutate>) {
    await swr.mutate(args[0], { revalidate: false });
  }

  const updateTask: UseTaskReturnType["updateTask"] = async (updatedTask) => {
    const { projectId, workspaceId } = useTaskKeyValidator.parse(params);

    await Promise.all([
      optimisticMutate(updatedTask),
      instantlyClient.updateTask({ projectId, workspaceId }, updatedTask),
    ]);
  };

  return { ...swr, updateTask };
}
