import useSWR, { SWRResponse, MutatorOptions } from "swr";
import { Project, Task, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import produce from "immer";

type UseProjectTasksReturnType = SWRResponse<Task[], any, any> & {
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

export const useProjectTasks = ({
  workspaceId,
  projectId,
}: {
  projectId: Project["id"];
  workspaceId: Workspace["id"];
}): UseProjectTasksReturnType => {
  const instantlyClient = useInstantlyClient();
  const { data, mutate, ...rest } = useSWR<
    Task[],
    any,
    () => ["workspaces", Workspace["id"], "projects", Project["id"], "tasks"]
  >(
    () => ["workspaces", workspaceId, "projects", projectId, "tasks"],
    ([, workspaceId, , projectId]) =>
      instantlyClient.getProjectTasks({ workspaceId, projectId })
  );

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

  return { data, mutate, toggleTaskArchived, updateTask, ...rest };
};
