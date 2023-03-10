import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useParams, useSearchParams } from "react-router-dom";
import { TaskWidget } from "./TaskWidget";
import { z } from "zod";
import { TasksListPane } from "./TasksListPane";
import { useTasks, useTasksDefaultFilters } from "./useTasks";
import { useProject } from "./useProject";
import produce from "immer";
import { Task, TaskStatus } from "instantly-core";
import { generateId } from "src/features/generateId";

interface IProjectIdPageProps {}

const projectIdPageParamsSchema = z.object({
  projectId: z.string(),
  workspaceId: z.string(),
});

const ProjectIdPage: React.FC<IProjectIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
  }>();

  const { workspaceId, projectId } = projectIdPageParamsSchema.parse(params);
  const { data: project } = useProject({ workspaceId, projectId });
  const {
    data: tasks,
    createTask,
    updateTask,
    deleteTask,
    optimisticMutate: mutateTasks,
  } = useTasks({
    projectId,
    workspaceId,
    filters: useTasksDefaultFilters,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTaskId = searchParams.get("taskId");
  const dividerColor = useColorModeValue("gray.200", "gray.700");

  const selectedTask = React.useMemo(() => {
    if (!selectedTaskId) return undefined;
    return tasks?.find((_task) => _task.id === selectedTaskId);
  }, [selectedTaskId, tasks]);

  function handleDeleteTask(task: Task) {
    setSearchParams((prev) => {
      prev.delete("taskId");
      return prev;
    });
    deleteTask(task.id);
  }

  async function handleCreateTask() {
    const newTask: Task = {
      id: generateId(),
      archived: false,
      title: "",
      description: "",
      status: z.string().parse(project?.defaultTaskStatusId),
    };
    createTask(newTask);
    setSearchParams((prev) => {
      prev.set("taskId", newTask.id);
      return prev;
    });
  }

  async function handleArchiveTask(task: Task) {
    updateTask(
      task.id,
      produce(task, (draft) => {
        draft.archived = true;
      })
    );
    mutateTasks(tasks!.filter((task) => task.id !== selectedTaskId));
  }

  async function handleTaskStatusChange(task: Task, status: TaskStatus) {
    updateTask(
      task.id,
      produce(task, (draft) => {
        draft.status = status.id;
      })
    );
  }

  async function handleTaskUpdated(updatedTask: Task) {
    if (updatedTask.archived) {
      // if the task was archived, we remove it from the current list and close the task page
      mutateTasks(tasks!.filter((task) => task.id !== selectedTaskId));
      setSearchParams((prev) => {
        prev.delete("taskId");
        return prev;
      });
    } else {
      const taskIndex = tasks!.findIndex((task) => task.id === updatedTask.id);
      if (taskIndex === -1) return tasks;
      const updatedTasks = produce(tasks!, (draft) => {
        draft[taskIndex] = updatedTask;
      });
      // otherwise, we update the task in the current list
      mutateTasks(updatedTasks);
    }
  }

  if (!tasks) return null;

  return (
    <>
      {selectedTaskId && (
        <>
          <Box
            float={{ base: "none", lg: "right" }}
            w={{ base: "full", lg: "60%" }}
            py={8}
            px={{ base: 2, lg: 4 }}
            height={{ base: "none", lg: "calc(100dvh - 80px)" }}
            maxHeight={{ base: "none", lg: "calc(100dvh - 80px)" }}
            overflowY="auto"
            borderLeftWidth="1px"
            borderLeftColor={dividerColor}
          >
            <TaskWidget
              initialTaskData={selectedTask}
              onDeleteTaskIntent={handleDeleteTask}
              onTaskUpdated={handleTaskUpdated}
            />
          </Box>
        </>
      )}
      <Box
        maxW={selectedTaskId ? "none" : "container.md"}
        mx={selectedTaskId ? "0" : "auto"}
      >
        <TasksListPane
          workspaceId={workspaceId}
          projectId={projectId}
          onCreateTaskIntent={handleCreateTask}
          onTaskArchivedIntent={handleArchiveTask}
          onTaskStatusChangeIntent={handleTaskStatusChange}
          tasks={tasks}
          activeTaskId={searchParams.get("taskId") ?? undefined}
          boxProps={{
            float: { base: "none", lg: "left" },
            w: { base: "full", lg: selectedTaskId ? "40%" : "full" },
            maxH: { base: "none", lg: "calc(100dvh - 80px)" },
            overflowY: "auto",
          }}
        />
      </Box>
    </>
  );
};

export default ProjectIdPage;
