import React from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  useBoolean,
  useColorModeValue,
} from "@chakra-ui/react";
import { Project, Workspace } from "instantly-core";
import { useForm } from "react-hook-form";

interface ICreateProjectButtonProps {
  workspaceId: Workspace["id"];
  onCreateProject: (projectName: Project["name"]) => Promise<void>;
}

export const CreateProjectButton: React.FC<ICreateProjectButtonProps> = ({
  onCreateProject,
}) => {
  const [isCreatingProject, setIsCreatingProject] = useBoolean(false);
  const inputBg = useColorModeValue("gray.100", "gray.600");
  const buttonHoverBgColor = useColorModeValue("cyan.400", "cyan.600");
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const nameErrorMessage = errors.name?.message?.toString();

  if (isCreatingProject) {
    return (
      <form
        onSubmit={handleSubmit((values) => {
          setIsCreatingProject.on();
          onCreateProject(values.name).finally(() => {
            reset();
            setIsCreatingProject.off();
          });
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
        shadow="md"
        _hover={{ bg: buttonHoverBgColor }}
      >
        Create Project
      </Button>
    );
  }
};
