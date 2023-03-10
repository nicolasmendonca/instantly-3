import useSWR, { SWRResponse, MutatorOptions, SWRConfiguration } from "swr";
import { Project, Task, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import produce from "immer";
import { useAuth } from "src/features/auth/AuthProvider";

type UseTasksParam = {
  workspaceId: Workspace["id"];
  projectId: Project["id"];
};

type UseTasksKey = UseTasksParam & {
  key: "tasks";
};

type UseProjectTasksReturnType = SWRResponse<Task[], any, any> & {
  createTask: (taskPayload?: Partial<Omit<Task, "id">>) => Promise<Task>;
  toggleTaskArchived: (
    taskId: Task["id"],
    mutatorOptions?: MutatorOptions
  ) => Promise<void>;
  updateTask: (
    taskId: Task["id"],
    updatedTask: Task,
    mutatorOptions?: MutatorOptions
  ) => Promise<void>;
};

export function useTasks(
  { workspaceId, projectId }: UseTasksParam,
  swrConfig: SWRConfiguration = {}
): UseProjectTasksReturnType {
  const instantlyClient = useInstantlyClient();
  const { data, mutate, ...rest } = useSWR<Task[], any, () => UseTasksKey>(
    () => ({
      key: `tasks`,
      workspaceId,
      projectId,
    }),
    instantlyClient.getTasksForProject,
    swrConfig
  );

  const createTask: UseProjectTasksReturnType["createTask"] = async (
    taskPayload
  ) => {
    const task: Omit<Task, "id"> = {
      archived: false,
      title: "",
      description: "",
      status: "In Backlog",
      ...taskPayload,
    };

    const newTask = await instantlyClient.createTask(
      {
        projectId,
        workspaceId,
      },
      task
    );

    const updatedTasks = produce(data, (tasks) => {
      tasks?.push(newTask);
    });

    mutate(updatedTasks, {
      revalidate: false,
    });

    return newTask;
  };

  const updateTask: UseProjectTasksReturnType["updateTask"] = async (
    taskId,
    updatedTask,
    mutatorOptions = {}
  ) => {
    if (!data) throw new Error("No data found on useProjectTasks@updateTask");
    const optimisticData = produce(data, (draft) => {
      const taskIndex = draft.findIndex((_task) => _task.id === taskId);
      if (taskIndex === -1)
        throw new Error("taskIndex === -1 on useProjectTasks@updateTask");
      draft[taskIndex] = updatedTask;
    });
    await mutate(
      async (_data) => {
        await instantlyClient.updateTask(
          {
            workspaceId,
            projectId,
            taskId: taskId,
          },
          updatedTask
        );
        return optimisticData;
      },
      {
        optimisticData,
        ...mutatorOptions,
      }
    );
  };

  const toggleTaskArchived: UseProjectTasksReturnType["toggleTaskArchived"] =
    async (taskId: Task["id"], mutatorOptions = {}): Promise<void> => {
      if (!data)
        throw new Error("No data found on useProjectTasks@toggleTaskArchived");

      const task = data.find((_task) => _task.id === taskId);
      if (!task)
        throw new Error("No task found on useProjectTasks@toggleTaskArchived");
      const updatedTask = produce(task, (draft) => {
        draft.archived = !draft.archived;
      });
      await updateTask(taskId, updatedTask, mutatorOptions);
    };

  return { data, mutate, toggleTaskArchived, updateTask, createTask, ...rest };
}
