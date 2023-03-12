import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useParams, useSearchParams } from "react-router-dom";
import TaskIdPage from "./TaskWidget";
import { z } from "zod";
import { TasksListPane } from "./TasksListPane";
import { useTasks } from "./useTasks";
import { useProject } from "./useProject";
import produce from "immer";
import { Task, TaskStatus } from "instantly-client";

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
    mutate: mutateTasks,
  } = useTasks({
    projectId,
    workspaceId,
    filters: {
      archived: false,
    },
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTaskId = searchParams.get("taskId");
  const dividerColor = useColorModeValue("gray.200", "gray.700");

  function handleDeleteTask(task: Task) {
    setSearchParams((prev) => {
      prev.delete("taskId");
      return prev;
    });
    deleteTask(task.id);
  }

  async function handleCreateTask() {
    await createTask({
      status: z.string().parse(project?.defaultTaskStatusId),
    });
  }

  async function handleArchiveTask(task: Task) {
    await updateTask(
      task.id,
      produce(task, (draft) => {
        draft.archived = true;
      })
    );
    mutateTasks(() => tasks?.filter((task) => task.id !== selectedTaskId));
  }

  async function handleTaskStatusChange(task: Task, status: TaskStatus) {
    await updateTask(
      task.id,
      produce(task, (draft) => {
        draft.status = status.id;
      })
    );
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
            <TaskIdPage onDeleteTaskIntent={handleDeleteTask} />
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
