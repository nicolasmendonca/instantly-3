import React from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  useBoolean,
  useColorModeValue,
} from "@chakra-ui/react";
import { Project, Workspace } from "instantly-client";
import { useForm } from "react-hook-form";
import { instantlyClient } from "../clients/instantlyClient";

interface ICreateProjectButtonProps {
  workspaceId: Workspace["id"];
  onProjectCreated: (projectId: Project["id"]) => void;
}

export const CreateProjectButton: React.FC<ICreateProjectButtonProps> = ({
  workspaceId,
  onProjectCreated,
}) => {
  const [isCreatingProject, setIsCreatingProject] = useBoolean(false);
  const inputBg = useColorModeValue("gray.100", "gray.600");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const nameErrorMessage = errors.name?.message?.toString();

  if (isCreatingProject) {
    return (
      <form
        onSubmit={handleSubmit(async (values) => {
          const name = values.name;
          setIsCreatingProject.off();
          const projectId = await instantlyClient.createProject({
            workspaceId,
            name,
          });
          onProjectCreated(projectId);
        })}
      >
        <FormControl isInvalid={nameErrorMessage !== undefined}>
          <Input
            errorBorderColor="red.300"
            autoFocus
            placeholder="Project name"
            {...register("name", {
              required: "Project name is required",
            })}
            onBlur={setIsCreatingProject.off}
            bg={inputBg}
          />
          <FormErrorMessage>{nameErrorMessage}</FormErrorMessage>
        </FormControl>
      </form>
    );
  } else {
    return (
      <Button
        isLoading={isSubmitting}
        onClick={setIsCreatingProject.on}
        width="full"
        variant="ghost"
        size="sm"
        py={5}
        borderWidth={1}
        borderColor="gray.500"
        _hover={{ bg: "cyan.700" }}
      >
        Create Project
      </Button>
    );
  }
};
