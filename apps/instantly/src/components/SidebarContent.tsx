import React from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Link as RRDLink, useLocation, useNavigate } from "react-router-dom";
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  useColorModeValue,
  Tooltip,
  Heading,
  FlexProps,
  Link,
  BoxProps,
  Divider,
} from "@chakra-ui/react";
import { useWorkspace } from "src/features/workspaces/useWorkspace";
import { useProjects } from "src/features/projects/useProjects";
import { Workspace } from "instantly-client";
import { CreateProjectButton } from "./CreateProjectButton";

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
  const { data: projects, mutate: mutateProjects } = useProjects({
    workspaceId,
  });
  const sidebarBg = useColorModeValue("white", "gray.900");
  const navigate = useNavigate();

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
          <Tooltip label="Back to workspaces">
            <IconButton
              my={2}
              to="/workspaces"
              aria-label="Back to workspaces"
              as={RRDLink}
              variant="ghost"
            >
              <ArrowBackIcon height={5} width={5} />
            </IconButton>
          </Tooltip>
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
            onProjectCreated={(projectId) => {
              navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
              mutateProjects();
            }}
          />
        </Box>
        <Divider />
      </Box>

      <Box pt={2}>
        {projects?.map((project) => (
          <NavItem
            onLinkClicked={onClose}
            key={project.id}
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
}
const NavItem = ({ children, url, onLinkClicked, ...rest }: NavItemProps) => {
  const location = useLocation();
  const activeLinkColor = useColorModeValue("cyan.300", "cyan.800");
  const hoverColor = useColorModeValue("cyan.400", "cyan.600");
  const hoverTextColor = useColorModeValue("black", "white");

  const isActiveRoute = location.pathname === url;
  return (
    <Link
      as={RRDLink}
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
