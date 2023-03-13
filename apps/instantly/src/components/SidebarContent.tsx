import React from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  CloseButton,
  Flex,
  useColorModeValue,
  Tooltip,
  Heading,
  FlexProps,
  BoxProps,
  Divider,
} from "@chakra-ui/react";
import { useWorkspace } from "src/features/workspaces/useWorkspace";
import { useProjects } from "src/features/projects/useProjects";
import {
  buildProjectObject,
  buildTaskStatusObject,
  Project,
  TaskStatus,
  Workspace,
} from "instantly-core";
import { CreateProjectButton } from "./CreateProjectButton";
import { Link } from "./Link";

export const SIDEBAR_WIDTH = 80;

interface SidebarProps extends BoxProps {
  workspaceId: Workspace["id"];
  onClose: () => void;
}

export const SidebarContent = ({
  workspaceId,
  onClose,
  ...rest
}: SidebarProps) => {
  const { data: workspace } = useWorkspace({ workspaceId });
  const { data: projects, create } = useProjects({
    workspaceId,
  });
  const sidebarBg = useColorModeValue("white", "gray.900");
  const navigate = useNavigate();

  async function handleCreateProject(projectName: Project["name"]) {
    const taskStatuses: TaskStatus[] = [
      buildTaskStatusObject({
        label: "To Do",
      }),
      buildTaskStatusObject({
        label: "In Progress",
      }),
      buildTaskStatusObject({
        label: "Done",
      }),
    ];
    const project: Project = buildProjectObject({
      name: projectName,
      defaultTaskStatusId: taskStatuses[0].id,
    });

    create({
      project,
      taskStatuses,
      workspaceId,
    });

    navigate(`/workspaces/${workspaceId}/projects/${project.id}`);
  }

  return (
    <Box
      maxHeight="100dvh"
      overflowY="auto"
      transition=".3s ease-in-out"
      bg={sidebarBg}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", lg: SIDEBAR_WIDTH }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Box position="sticky" top={0} bg={sidebarBg}>
        <Flex
          alignItems="center"
          justifyContent={{ base: "space-between", lg: "start" }}
          gap={4}
          pt={1}
        >
          <Link to="/workspaces" py={2} pl={4}>
            <Tooltip label="Back to workspaces">
              <ArrowBackIcon height={5} width={5} />
            </Tooltip>
          </Link>
          <Heading
            size={{ base: "lg", lg: "xs" }}
            transition="all .3s ease-in-out"
          >
            {workspace?.name}
          </Heading>
          <CloseButton
            display={{ base: "flex", lg: "none" }}
            onClick={onClose}
          />
        </Flex>
        <Box mx="4" my="4">
          <CreateProjectButton
            workspaceId={workspaceId}
            onCreateProject={handleCreateProject}
          />
        </Box>
        <Divider />
      </Box>
      <Box pt={2}>
        {projects?.map((project) => (
          <NavItem
            onLinkClicked={onClose}
            key={project.id}
            projectId={project.id}
            url={`/workspaces/${workspaceId}/projects/${project.id}`}
          >
            {project.emoji ? `${project.emoji} ${project.name}` : project.name}
          </NavItem>
        ))}
      </Box>
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  onLinkClicked: () => void;
  children: React.ReactNode;
  url: string;
  projectId: Project["id"];
}
const NavItem = ({
  children,
  url,
  onLinkClicked,
  projectId,
  ...rest
}: NavItemProps) => {
  const location = useLocation();
  const activeLinkColor = useColorModeValue("cyan.300", "cyan.800");
  const hoverColor = useColorModeValue("cyan.400", "cyan.600");
  const hoverTextColor = useColorModeValue("black", "white");

  const isActiveRoute = location.pathname.includes(projectId);
  return (
    <Link
      to={url}
      textDecoration="none !important"
      onClick={onLinkClicked}
      fontSize="sm"
    >
      <Flex
        align="center"
        px="4"
        py="2"
        mx="4"
        my="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        transition="all .2s ease-in-out"
        bgColor={isActiveRoute ? activeLinkColor : "transparent"}
        textDecoration="none"
        _hover={{
          bg: hoverColor,
          color: hoverTextColor,
        }}
        {...rest}
      >
        {children}
      </Flex>
    </Link>
  );
};
