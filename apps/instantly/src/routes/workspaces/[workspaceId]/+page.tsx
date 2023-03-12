import React from "react";
import { Workspace } from "instantly-client";
import { useParams } from "react-router-dom";
import { Box, Center, Img } from "@chakra-ui/react";

interface IWorkspaceIdPageProps {}

const WorkspaceIdPage: React.FC<IWorkspaceIdPageProps> = () => {
  const { workspaceId } = useParams<{ workspaceId: Workspace["id"] }>();

  if (!workspaceId) throw new Error("Workspace id is required");

  return (
    <Center>
      <Box w="container.md">
        <Img src="/project-manager.svg" alt="" />
      </Box>
    </Center>
  );
};

export default WorkspaceIdPage;
