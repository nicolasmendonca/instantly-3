import React from "react";
import {
  Divider,
  Stack,
  useColorModeValue,
  EditablePreview,
  EditableTextarea,
  EditableInput,
  Flex,
  Text,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useTask } from "./useTask";
import { useParams, useSearchParams } from "react-router-dom";
import { APP_SETTINGS } from "src/features/appSettings";
import { EditableButton, EditableValue } from "src/components/EditableValue";
import produce from "immer";
import { useTasks } from "./useTasks";
import { TaskStatusDropdown } from "./TaskStatusDropdown";
import { useTaskStatuses } from "./useTaskStatuses";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Task, TaskStatus } from "instantly-client";
import { useAuth } from "src/features/auth/AuthProvider";

interface ITaskIdPageProps {
  onDeleteTaskIntent: (task: Task) => void;
}

const TaskIdPage: React.FC<ITaskIdPageProps> = ({ onDeleteTaskIntent }) => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const workspaceId = params.workspaceId!;
  const projectId = params.projectId!;
  const taskId = searchParams.get("taskId")!;

  const { data: tasks, mutate: mutateTasks } = useTasks({
    projectId,
    workspaceId,
    filters: {
      archived: false,
    },
  });
  const { data: task, updateTask } = useTask({
    workspaceId,
    projectId,
    taskId,
    userId: user?.id,
  });
  const { data: taskStatuses } = useTaskStatuses({
    projectId,
    workspaceId,
  });
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  React.useEffect(() => {
    if (task?.title) {
      document.title = task.title;
    }
  }, [task?.title]);

  const currentTaskStatus = taskStatuses!.find(
    (status) => status.id === task!.status
  )!;

  async function handleArchiveTask() {
    await updateTask(
      taskId,
      produce(task!, (draft) => {
        draft.archived = true;
      })
    );
    mutateTasks(() => tasks?.filter((task) => task.id !== taskId));
  }

  function handleChangeTaskStatus(status: TaskStatus) {
    updateTask(
      taskId,
      produce(task!, (draft) => {
        draft.status = status.id;
      })
    );

    const updatedTasks = produce(tasks!, (draft) => {
      const taskIndex = draft.findIndex((_task) => _task.id === taskId);
      if (taskIndex === -1)
        throw new Error("taskIndex === -1 on useProjectTasks@updateTask");
      draft[taskIndex].status = status.id;
    });
    mutateTasks(updatedTasks);
  }

  if (!task || !taskStatuses) return null;

  return (
    <Stack gap={2}>
      <EditableValue
        placeholder="Task Title"
        key={`editable-title-${taskId}`}
        defaultValue={task.title}
        onSubmit={async (newTitle) => {
          await updateTask(
            taskId,
            produce(task, (draft) => {
              draft.title = newTitle;
            })
          );
          await mutateTasks();
        }}
        fontSize="2xl"
        fontWeight="extrabold"
      >
        <EditablePreview
          px={2}
          wordBreak="break-word"
          color={task.title === "" ? "gray" : "initial"}
        />
        <EditableInput px={2} maxLength={APP_SETTINGS.TASK_TITLE_MAX_LENGTH} />
        <EditableButton />
      </EditableValue>
      <Divider borderColor={dividerColor} />
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <Text fontWeight="bold">Status</Text>
          <TaskStatusDropdown
            status={currentTaskStatus}
            statusOptions={taskStatuses}
            onChange={handleChangeTaskStatus}
          />
        </Flex>

        <Menu>
          <MenuButton as={IconButton} aria-label="Options">
            <HamburgerIcon />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleArchiveTask}>Archive task</MenuItem>
            <MenuItem onClick={() => onDeleteTaskIntent(task)}>
              Delete task
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <EditableValue
        placeholder="Task Description"
        key={`editable-description-${taskId}`}
        defaultValue={task.description}
        onSubmit={async (newDescription) => {
          await updateTask(
            taskId,
            produce(task, (draft) => {
              draft.description = newDescription;
            })
          );
        }}
      >
        <EditablePreview
          px={2}
          whiteSpace="break-spaces"
          wordBreak="break-word"
          color={task.description === "" ? "gray" : "initial"}
        />
        <EditableTextarea px={2} rows={12} />
        <EditableButton />
      </EditableValue>
    </Stack>
  );
};

export default TaskIdPage;
