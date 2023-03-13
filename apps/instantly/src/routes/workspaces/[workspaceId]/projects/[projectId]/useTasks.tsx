import produce from "immer";
import useSWR, {
  SWRResponse,
  MutatorOptions,
  SWRConfiguration,
  preload,
} from "swr";
import {
  Project,
  Task,
  TaskStatus,
  Workspace,
} from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseTasksParam = {
  workspaceId: Workspace["id"];
  projectId: Project["id"];
  filters?: Partial<UseTasksFilters>;
};

type UseTasksFilters = {
  archived?: boolean;
  status?: TaskStatus["id"] | null;
};

export const useTasksDefaultFilters: Required<UseTasksFilters> = {
  archived: false,
  status: null,
};

type UseTasksKey = Pick<UseTasksParam, "workspaceId" | "projectId"> & {
  key: "tasks";
  archivedFilter: boolean;
  statusFilter: TaskStatus["id"] | null;
};

type UseProjectTasksReturnType = SWRResponse<Task[], any, any> & {
  createTask: (taskPayload: Task) => Promise<void>;
  toggleTaskArchived: (taskId: Task["id"]) => Promise<void>;
  updateTask: (taskId: Task["id"], updatedTask: Task) => Promise<void>;
  deleteTask: (taskId: Task["id"]) => Promise<void>;
  optimisticMutate: (tasks: Task[]) => Promise<void>;
};

export function useTasks(
  { workspaceId, projectId, filters = {} }: UseTasksParam,
  swrConfig: SWRConfiguration = {}
): UseProjectTasksReturnType {
  const instantlyClient = useInstantlyClient();
  const swr = useSWR<Task[], any, () => UseTasksKey>(
    () => ({
      key: `tasks`,
      workspaceId,
      projectId,
      archivedFilter: filters.archived ?? useTasksDefaultFilters.archived,
      statusFilter: filters.status ?? useTasksDefaultFilters.status,
    }),
    ({ workspaceId, projectId, archivedFilter, statusFilter }) =>
      instantlyClient.getTasksForProject({
        workspaceId,
        projectId,
        filters: {
          archived: archivedFilter,
          status: statusFilter ?? undefined,
        },
      }),
    swrConfig
  );

  async function optimisticMutate(tasks: Task[]) {
    await swr.mutate(tasks, { revalidate: false });
  }

  const createTask: UseProjectTasksReturnType["createTask"] = async (
    taskPayload
  ) => {
    const updatedTasks = produce(swr.data!, (tasks) => {
      tasks?.push(taskPayload);
    });

    await Promise.all([
      instantlyClient.createTask(
        {
          projectId,
          workspaceId,
        },
        taskPayload
      ),
      optimisticMutate(updatedTasks),
    ]);
  };

  const updateTask: UseProjectTasksReturnType["updateTask"] = async (
    taskId,
    updatedTask
  ) => {
    const optimisticData = produce(swr.data!, (draft) => {
      const taskIndex = draft.findIndex((_task) => _task.id === taskId);
      if (taskIndex === -1)
        throw new Error("taskIndex === -1 on useProjectTasks@updateTask");
      draft[taskIndex] = updatedTask;
    });
    await Promise.all([
      instantlyClient.updateTask(
        {
          workspaceId,
          projectId,
        },
        updatedTask
      ),
      optimisticMutate(optimisticData),
    ]);
  };

  const toggleTaskArchived: UseProjectTasksReturnType["toggleTaskArchived"] =
    async (taskId: Task["id"]): Promise<void> => {
      if (!swr.data)
        throw new Error("No data found on useProjectTasks@toggleTaskArchived");

      const task = swr.data.find((_task) => _task.id === taskId);
      const updatedTask = produce(task!, (draft) => {
        draft.archived = !draft.archived;
      });
      await updateTask(taskId, updatedTask);
    };

  const deleteTask: UseProjectTasksReturnType["deleteTask"] = async (
    taskId
  ) => {
    const optimisticData = swr.data!.filter((task) => task.id !== taskId);

    await Promise.all([
      instantlyClient.deleteTask({
        workspaceId,
        projectId,
        taskId,
      }),
      optimisticMutate(optimisticData),
    ]);
  };

  return {
    ...swr,
    toggleTaskArchived,
    updateTask,
    createTask,
    deleteTask,
    optimisticMutate,
  };
}

export async function preloadTasks(params: UseTasksParam, tasks: Task[]) {
  const key: UseTasksKey = {
    key: "tasks",
    projectId: params.projectId,
    workspaceId: params.projectId,
    archivedFilter: params.filters?.archived ?? useTasksDefaultFilters.archived,
    statusFilter: params.filters?.status ?? useTasksDefaultFilters.status,
  };
  await preload(key, () => tasks);
}
