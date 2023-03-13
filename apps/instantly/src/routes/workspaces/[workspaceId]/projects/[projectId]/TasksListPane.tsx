import {
  BoxProps,
  useBoolean,
  Link,
  TableContainer,
  Button,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Checkbox,
  Text,
  Box,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/system";
import { Workspace, Project, Task, TaskStatus } from "instantly-core";
import React from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Link as RRDLink } from "react-router-dom";
import { TaskStatusDropdown } from "./TaskStatusDropdown";
import { useTaskStatuses } from "./useTaskStatuses";

export const TasksListPane: React.FC<{
  boxProps: BoxProps;
  workspaceId: Workspace["id"];
  projectId: Project["id"];
  tasks: Task[];
  activeTaskId?: Task["id"];
  onTaskArchivedIntent: (task: Task) => void;
  onCreateTaskIntent: () => Promise<void>;
  onTaskStatusChangeIntent: (task: Task, newStatus: TaskStatus) => void;
}> = ({
  boxProps,
  activeTaskId,
  workspaceId,
  projectId,
  tasks,
  onTaskArchivedIntent,
  onCreateTaskIntent,
  onTaskStatusChangeIntent,
}) => {
  const [isCreatingTask, setIsCreatingTask] = useBoolean();
  const { data: taskStatuses } = useTaskStatuses({
    workspaceId,
    projectId,
  });
  const [showConfettiForTaskId, setShowConfettiForTaskId] = React.useState("");
  const untitledTaskColor = useColorModeValue("blackAlpha.600", "gray");
  const titledTaskColor = useColorModeValue("black", "white");
  const activeTaskTrBgColor = useColorModeValue("cyan.300", "cyan.800");

  const handleTaskArchivedChange = async (task: Task) => {
    if (!tasks) return;
    setShowConfettiForTaskId(task.archived ? "" : task.id);
    onTaskArchivedIntent(task);
  };

  const handleAddNewTask = async () => {
    setIsCreatingTask.on();
    onCreateTaskIntent().finally(() => {
      setIsCreatingTask.off();
    });
  };

  if (!tasks || !taskStatuses) return null;

  return (
    <Box {...boxProps}>
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
              )!;

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
                        onTaskStatusChangeIntent(task, newStatus)
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
