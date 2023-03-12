import React from "react";
import {
  Box,
  BoxProps,
  Button,
  Checkbox,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBoolean,
  useColorModeValue,
} from "@chakra-ui/react";
import ConfettiExplosion from "react-confetti-explosion";
import { Link as RRDLink, useParams, useSearchParams } from "react-router-dom";
import { Project, Task, TaskStatus, Workspace } from "instantly-client";
import { useTasks } from "./useTasks";
import { TaskStatusDropdown } from "./TaskStatusDropdown";
import produce from "immer";
import { useTaskStatuses } from "./useTaskStatuses";
import TaskIdPage from "./TaskWidget";
import { useProject } from "./useProject";

interface IProjectIdPageProps {}

const ProjectIdPage: React.FC<IProjectIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const [searchParams] = useSearchParams();
  const selectedTaskId = searchParams.get("taskId");
  const dividerColor = useColorModeValue("gray.200", "gray.700");

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
            <TaskIdPage />
          </Box>
        </>
      )}
      <Box
        maxW={selectedTaskId ? "none" : "container.md"}
        mx={selectedTaskId ? "0" : "auto"}
      >
        <TasksListPane
          workspaceId={params.workspaceId!}
          projectId={params.projectId!}
          float={{ base: "none", lg: "left" }}
          w={{ base: "full", lg: selectedTaskId ? "40%" : "full" }}
          maxH={{ base: "none", lg: "calc(100dvh - 80px)" }}
          overflowY="auto"
        />
      </Box>
    </>
  );
};

const TasksListPane: React.FC<
  BoxProps & {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }
> = ({ workspaceId, projectId, ...props }) => {
  const [isCreatingTask, setIsCreatingTask] = useBoolean();
  const {
    data: tasks,
    toggleTaskArchived,
    createTask,
    updateTask,
  } = useTasks({
    workspaceId,
    projectId,
    filters: {
      archived: false,
    },
  });
  const { data: taskStatuses } = useTaskStatuses({
    workspaceId,
    projectId,
  });
  const { data: project } = useProject({
    workspaceId,
    projectId,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [showConfettiForTaskId, setShowConfettiForTaskId] = React.useState("");
  const untitledTaskColor = useColorModeValue("blackAlpha.600", "gray");
  const titledTaskColor = useColorModeValue("black", "white");
  const activeTaskTrBgColor = useColorModeValue("cyan.300", "cyan.800");
  const activeTaskId = searchParams.get("taskId");

  const handleTaskArchivedChange = async (task: Task) => {
    if (!tasks) return;
    setShowConfettiForTaskId(task.archived ? "" : task.id);
    toggleTaskArchived(task.id, { revalidate: false });
  };

  const handleAddNewTask = async () => {
    setIsCreatingTask.on();
    const createdTask = await createTask({
      status: project!.defaultTaskStatusId,
    });
    setSearchParams({ taskId: createdTask.id });
    setIsCreatingTask.off();
  };

  const handleChangeTaskStatus = async (task: Task, status: TaskStatus) => {
    updateTask(
      task.id,
      produce(task, (draft) => {
        draft.status = status.id;
      })
    );
  };

  if (!tasks || !taskStatuses) return null;

  return (
    <Box {...props}>
      <TableContainer>
        <Button
          size="sm"
          mx={2}
          my={4}
          onClick={handleAddNewTask}
          isLoading={isCreatingTask}
        >
          Add New Task
        </Button>
        <Table>
          <Thead>
            <Tr>
              <Th px={2}></Th>
              <Th px={2}>Title</Th>
              <Th px={2}>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks?.map((task) => {
              const taskStatus = taskStatuses.find(
                (taskStatus) => taskStatus.id === task.status
              );

              if (!taskStatus) throw new Error("Task status not found");
              return (
                <Tr
                  key={task.id}
                  transition="all .2s ease-in-out"
                  bgColor={
                    activeTaskId === task.id ? activeTaskTrBgColor : "initial"
                  }
                >
                  <Td textAlign="center" px={2}>
                    <Checkbox
                      isChecked={task.archived}
                      onChange={() => handleTaskArchivedChange(task)}
                    />
                    {showConfettiForTaskId === task.id && <ConfettiExplosion />}
                  </Td>
                  <Td px={2} w="full">
                    <Link
                      as={RRDLink}
                      to={{
                        search: `taskId=${task.id}`,
                      }}
                      color={titledTaskColor}
                      _hover={{
                        color: activeTaskId ? "initial" : "cyan.700",
                        textDecoration: "underline",
                      }}
                    >
                      {task.title ? (
                        task.title
                      ) : (
                        <Text
                          as="span"
                          color={
                            activeTaskId === task.id
                              ? "white"
                              : untitledTaskColor
                          }
                        >
                          Untitled task
                        </Text>
                      )}
                    </Link>
                  </Td>
                  <Td px={2}>
                    <TaskStatusDropdown
                      status={taskStatus}
                      statusOptions={taskStatuses}
                      onChange={(newStatus) =>
                        handleChangeTaskStatus(task, newStatus)
                      }
                      menuProps={{ size: "sm" }}
                      buttonProps={{ size: "xs" }}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectIdPage;
