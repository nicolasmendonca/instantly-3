import React from "react";
import {
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Progress,
  useBoolean,
  useColorModeValue,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ArrowForwardIcon } from "@chakra-ui/icons";

interface ICreateNewWorkspaceProps {
  onNewWorkspaceSubmitted: (name: string) => Promise<void>;
}

export const CreateNewWorkspace: React.FC<ICreateNewWorkspaceProps> = ({
  onNewWorkspaceSubmitted,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const nameErrorMessage = errors.name?.message
    ? errors.name.message?.toString()
    : "";
  const nameHasError = nameErrorMessage !== "";

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onNewWorkspaceSubmitted(values.name);
      })}
    >
      <Progress
        hasStripe
        value={50}
        mb="5%"
        mx="5%"
        isAnimated
        rounded="full"
      ></Progress>
      <Heading textAlign={"center"} fontWeight="bold" my="8" size="lg">
        Create New Workspace
      </Heading>
      <FormControl mt="4%" isInvalid={nameHasError}>
        <FormLabel htmlFor="name" fontWeight={"normal"}>
          Name of your workspace
        </FormLabel>
        <Input
          isInvalid={nameHasError}
          id="name"
          type="text"
          autoComplete="false"
          shadow="sm"
          bg={useColorModeValue("gray.100", "gray.900")}
          {...register("name", {
            required: "Hey, you need to name your workspace!",
            minLength: { value: 4, message: "Make it a bit longer" },
          })}
        />
        <FormHelperText>Don't worry, this can be changed later!</FormHelperText>
        <FormErrorMessage>{nameErrorMessage}</FormErrorMessage>
      </FormControl>
      <Center mt="8">
        <Button
          type="submit"
          colorScheme="blue"
          rightIcon={<ArrowForwardIcon />}
          isLoading={isSubmitting}
        >
          Continue
        </Button>
      </Center>
    </form>
  );
};
