import { Box, Center } from "@chakra-ui/react";
import { Navbar } from "src/components/Navbar";
import { useAuth } from "src/features/auth/AuthProvider";
import { LoginPage } from "src/features/auth/LoginPage";
import { CreateNewWorkspace } from "src/features/workspaces/CreateNewWorkspace";
import { instantlyClient } from "./clients/instantlyClient";

function App() {
  const { user } = useAuth();

  const handleCreateNewWorkspace = async (name: string) => {
    await instantlyClient.createNewWorkspace(name);
  };

  if (user) {
    return (
      <>
        <Navbar />
        <Center height="calc(100dvh - 48px)">
          <Box
            w="container.xs"
            borderWidth={1}
            p={6}
            borderColor="gray.600"
            rounded="md"
          >
            <CreateNewWorkspace
              onNewWorkspaceSubmitted={handleCreateNewWorkspace}
            />
          </Box>
        </Center>
      </>
    );
  }

  return <LoginPage />;
}

export default App;
