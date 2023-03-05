import React from "react";
import { FcGoogle } from "react-icons/fc";
import {
  Button,
  Center,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "src/features/auth/AuthProvider";

interface ILoginPageProps {}

export const LoginPage: React.FC<ILoginPageProps> = () => {
  const { login } = useAuth();

  return (
    <Center p={8}>
      <Stack
        spacing={6}
        p={8}
        rounded="lg"
        align={"center"}
        maxW={"md"}
        w={"full"}
        bg={useColorModeValue("gray.100", "gray.900")}
      >
        <Heading size="md">Login to continue</Heading>
        <Button
          w={"full"}
          variant={"outline"}
          leftIcon={<FcGoogle />}
          onClick={login}
          bg={useColorModeValue("gray.300", "gray.700")}
        >
          <Center>
            <Text>Sign in with Google</Text>
          </Center>
        </Button>
      </Stack>
    </Center>
  );
};
