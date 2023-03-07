import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Center } from "@chakra-ui/react";
import { CreateNewWorkspace } from "src/features/workspaces/CreateNewWorkspace";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

interface NewWorkspacePageProps {}

const NewWorkspacePage: React.FC<NewWorkspacePageProps> = () => {
  const navigate = useNavigate();
  const instantlyClient = useInstantlyClient();
  const handleCreateNewWorkspace = async (name: string) => {
    const workspaceId = await instantlyClient.createNewWorkspace(name);
    navigate(`/workspaces/${workspaceId}`);
  };

  return (
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
  );
};

export default NewWorkspacePage;
