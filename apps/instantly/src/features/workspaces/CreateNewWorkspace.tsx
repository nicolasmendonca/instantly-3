import React from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Progress,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

interface ICreateNewWorkspaceProps {
  onNewWorkspaceSubmitted: (name: string) => Promise<void>;
}

export const CreateNewWorkspace: React.FC<ICreateNewWorkspaceProps> = ({
  onNewWorkspaceSubmitted,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onNewWorkspaceSubmitted(formData.get("name") as string);
      }}
    >
      <Progress
        hasStripe
        value={33.333}
        mb="5%"
        mx="5%"
        isAnimated
        rounded="full"
      ></Progress>
      <Heading textAlign={"center"} fontWeight="bold" my="8" size="lg">
        Create New Workspace
      </Heading>
      <FormControl mt="4%">
        <FormLabel htmlFor="name" fontWeight={"normal"}>
          Name of your workspace
        </FormLabel>
        <Input
          id="name"
          type="text"
          name="name"
          autoComplete="false"
          bg="gray.900"
        />
        <FormHelperText>Don't worry, this can be changed later!</FormHelperText>
      </FormControl>
      <Center mt="8">
        <Button
          type="submit"
          colorScheme="blue"
          rightIcon={<ArrowForwardIcon />}
        >
          Continue
        </Button>
      </Center>
    </form>
  );
};
