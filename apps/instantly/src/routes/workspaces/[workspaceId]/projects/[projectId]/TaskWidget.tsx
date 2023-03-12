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
import { TaskStatusDropdown } from "./TaskStatusDropdown";
import { useTaskStatuses } from "./useTaskStatuses";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Task, TaskStatus } from "instantly-client";
import { useAuth } from "src/features/auth/AuthProvider";

interface ITaskIdPageProps {
  onDeleteTaskIntent: (task: Task) => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

const TaskIdPage: React.FC<ITaskIdPageProps> = ({
  onDeleteTaskIntent,
  onTaskUpdated,
}) => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const workspaceId = params.workspaceId!;
  const projectId = params.projectId!;
  const taskId = searchParams.get("taskId")!;

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
    const updatedTask = produce(task!, (draft) => {
      draft.archived = true;
    });
    updateTask(taskId, updatedTask, {
      revalidate: false,
    });
    onTaskUpdated(updatedTask);
  }

  function handleChangeTaskStatus(status: TaskStatus) {
    const updatedTask = produce(task!, (draft) => {
      draft.status = status.id;
    });
    updateTask(taskId, updatedTask, {
      revalidate: false,
    });

    onTaskUpdated(updatedTask);
  }

  if (!task || !taskStatuses) return null;

  return (
    <Stack gap={2}>
      <EditableValue
        placeholder="Task Title"
        key={`editable-title-${taskId}`}
        defaultValue={task.title}
        onSubmit={async (newTitle) => {
          const updatedTask = produce(task, (draft) => {
            draft.title = newTitle;
          });
          updateTask(taskId, updatedTask);
          onTaskUpdated(updatedTask);
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
          const updatedTask = produce(task, (draft) => {
            draft.description = newDescription;
          });
          updateTask(taskId, updatedTask);
          onTaskUpdated(updatedTask);
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
