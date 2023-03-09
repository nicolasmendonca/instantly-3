import React from "react";
import { Link as RRDLink } from "react-router-dom";
import {
  Avatar,
  Button,
  Center,
  Divider,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useWorkspaces } from "./useWorkspaces";

interface IWorkspacesPageProps {}

const WorkspacesPage: React.FC<IWorkspacesPageProps> = () => {
  const { data: workspaces } = useWorkspaces();

  return (
    <Center height="100dvh">
      <Stack
        bg={useColorModeValue("gray.100", "gray.900")}
        p="12"
        rounded="lg"
        gap={4}
        shadow="lg"
      >
        {workspaces && workspaces.length > 0 && (
          <>
            {workspaces?.map((workspace) => (
              <Button
                key={workspace.id}
                as={RRDLink}
                to={`/workspaces/${workspace.id}`}
                leftIcon={<Avatar src={workspace.avatarUrl} />}
                minHeight="16"
              >
                {workspace.name}
              </Button>
            ))}
            <Divider borderColor={useColorModeValue("gray.400", "gray.700")} />
          </>
        )}
        <Button as={RRDLink} to={`/workspaces/new`} minHeight="16">
          Create New Workspace
        </Button>
      </Stack>
    </Center>
  );
};

export default WorkspacesPage;
