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

interface ITaskIdPageProps {}

const TaskIdPage: React.FC<ITaskIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
    taskId: string;
  }>();
  const { data } = useTask({
    workspaceId: params.workspaceId!,
    projectId: params.projectId!,
    taskId: params.taskId!,
  });
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  React.useEffect(() => {
    if (data?.title) {
      document.title = data.title;
    }
  }, [data?.title]);

  return (
    <Stack gap={2}>
      <EditableValue
        defaultValue={data?.title}
        fontSize="2xl"
        fontWeight="extrabold"
      >
        <EditablePreview px={2} wordBreak="break-word" />
        <EditableInput px={2} maxLength={APP_SETTINGS.TASK_TITLE_MAX_LENGTH} />
        <EditableButton />
      </EditableValue>
      <Divider borderColor={dividerColor} />
      <EditableValue defaultValue={data?.description}>
        <EditablePreview
          px={2}
          whiteSpace="break-spaces"
          wordBreak="break-word"
        />
        <EditableTextarea px={2} rows={12} />
        <EditableButton />
      </EditableValue>
    </Stack>
  );
};

export default TaskIdPage;
