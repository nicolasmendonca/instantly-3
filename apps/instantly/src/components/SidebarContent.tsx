import { ArrowBackIcon } from "@chakra-ui/icons";
import { Link as RRDLink, useLocation, useNavigate } from "react-router-dom";
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  useColorModeValue,
  Button,
  Tooltip,
  Heading,
  FlexProps,
  Link,
  BoxProps,
} from "@chakra-ui/react";
import { useWorkspace } from "src/features/workspaces/useWorkspace";
import { useProjects } from "src/features/projects/useProjects";
import { Workspace } from "instantly-client";
import { CreateProjectButton } from "./CreateProjectButton";

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
  const navigate = useNavigate();
  return (
    <Box
      transition=".3s ease-in-out"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Tooltip label="Back to workspaces" placement="right">
        <IconButton
          my={2}
          mx={8}
          to="/workspaces"
          aria-label="Back to workspaces"
          as={RRDLink}
          variant="ghost"
        >
          <ArrowBackIcon height={5} width={5} />
        </IconButton>
      </Tooltip>
      <Flex
        h="20"
        alignItems="center"
        mx="8"
        justifyContent="space-between"
        gap={4}
      >
        <Tooltip label={workspace?.name}>
          <Avatar src={workspace?.avatarUrl} />
        </Tooltip>
        <Heading
          size={{ base: "md", md: "xs" }}
          transition="all .3s ease-in-out"
        >
          {workspace?.name}
        </Heading>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {projects?.map((project) => (
        <NavItem
          onLinkClicked={onClose}
          key={project.id}
          url={`/workspaces/${workspaceId}/projects/${project.id}`}
        >
          {project.emoji ? `${project.emoji} ${project.name}` : project.name}
        </NavItem>
      ))}
      <Box mx="4" my="4">
        <CreateProjectButton
          workspaceId={workspaceId}
          onProjectCreated={(projectId) => {
            navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
            mutateProjects();
          }}
        />
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
  const activeLinkColor = useColorModeValue("cyan.50", "cyan.800");

  const isActiveRoute = location.pathname === url;
  return (
    <Link as={RRDLink} to={url} textDecor="none" onClick={onLinkClicked}>
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
        _hover={{
          bg: "cyan.600",
          color: "white",
        }}
        {...rest}
      >
        {children}
      </Flex>
    </Link>
  );
};
