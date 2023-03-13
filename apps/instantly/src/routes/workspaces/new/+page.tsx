import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Center } from "@chakra-ui/react";
import { CreateNewWorkspace } from "src/features/workspaces/CreateNewWorkspace";
import { useAuth } from "src/features/auth/AuthProvider";
import { buildWorkspaceObject } from "instantly-core";
import { useWorkspaces } from "../useWorkspaces";

interface NewWorkspacePageProps {}

const NewWorkspacePage: React.FC<NewWorkspacePageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { create } = useWorkspaces();
  const handleCreateNewWorkspace = async (name: string) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const workspacePayload = buildWorkspaceObject({
          name,
          userCreatorId: user!.id,
        });
        create(workspacePayload);
        navigate(`/workspaces/${workspacePayload.id}`);
        resolve(undefined);
      } catch (e) {
        reject(e instanceof Error ? e.message : e);
      }
    });
  };

  return (
    <Center height="100dvh">
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
