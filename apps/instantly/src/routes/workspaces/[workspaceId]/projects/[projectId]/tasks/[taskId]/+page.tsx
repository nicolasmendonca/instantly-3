import React from "react";
import {
  Divider,
  Stack,
  useColorModeValue,
  EditablePreview,
  EditableTextarea,
  EditableInput,
} from "@chakra-ui/react";
import { useTask } from "./useTask";
import { useParams } from "react-router-dom";
import { APP_SETTINGS } from "src/features/appSettings";
import { EditableButton, EditableValue } from "src/components/EditableValue";
import produce from "immer";
import { useTasks } from "../../useProjectTasks";

interface ITaskIdPageProps {}

const TaskIdPage: React.FC<ITaskIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
    taskId: string;
  }>();

  const workspaceId = params.workspaceId!;
  const projectId = params.projectId!;
  const taskId = params.taskId!;

  const { mutate: mutateTasks } = useTasks({
    projectId,
    workspaceId,
  });
  const { data: task, updateTask } = useTask({
    workspaceId,
    projectId,
    taskId,
  });
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  React.useEffect(() => {
    if (task?.title) {
      document.title = task.title;
    }
  }, [task?.title]);

  if (!task) return null;

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
