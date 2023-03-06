import React from "react";
import { ArrowBackIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link as RRDLink } from "react-router-dom";
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Button,
  useColorMode,
  Tooltip,
  Center,
  Heading,
} from "@chakra-ui/react";
import { FiMenu, FiBell, FiChevronDown } from "react-icons/fi";
import { Workspace } from "instantly-client";
import { useWorkspaceTasks } from "./useWorkspaceTasks";
import { useAuth } from "../../../features/auth/AuthProvider";
import { useWorkspace } from "../../../features/workspaces/useWorkspace";
import { useParams } from "react-router-dom";
import { useWorkspaceMemberProfile } from "../../../features/profile/useWorkspaceMemberProfile";
import { useProjects } from "../../../features/projects/useProjects";

export const SidebarWithHeader: React.FC<{
  children: React.ReactNode;
  workspaceId: Workspace["id"];
}> = ({ children, workspaceId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        workspaceId={workspaceId}
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent workspaceId={workspaceId} onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} onClose={onClose} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

interface SidebarProps extends BoxProps {
  workspaceId: Workspace["id"];
  onClose: () => void;
}

const SidebarContent = ({ workspaceId, onClose, ...rest }: SidebarProps) => {
  const { data: workspace } = useWorkspace({ workspaceId });
  const { data: projects } = useProjects({ workspaceId });
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
          key={project.id}
          url={`/workspaces/${workspaceId}/projects/${project.id}`}
        >
          {project.emoji ? `${project.emoji} ${project.name}` : project.name}
        </NavItem>
      ))}
      <Box mx="8" my="4">
        <Button
          width="full"
          variant="ghost"
          size="sm"
          py={4}
          borderWidth={1}
          borderColor="gray.500"
          _hover={{ bg: "cyan.700" }}
        >
          Create Project
        </Button>
      </Box>
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  children: React.ReactNode;
  url: string;
}
const NavItem = ({ children, url, ...rest }: NavItemProps) => {
  return (
    <Link
      as={RRDLink}
      to={url}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
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

interface MobileProps extends FlexProps {
  onOpen: () => void;
  onClose: () => void;
}
const MobileNav = ({ onOpen, onClose, ...rest }: MobileProps) => {
  const params = useParams<{ workspaceId: string }>();
  const { logout, user } = useAuth();
  const { data: workspaceMemberProfile } = useWorkspaceMemberProfile({
    memberId: user!.id,
    workspaceId: params!.workspaceId!,
  });
  const { data: workspace } = useWorkspace({
    workspaceId: params!.workspaceId!,
  });
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="2xl"
        fontWeight="bold"
      >
        {workspace?.name}
      </Text>

      <HStack spacing={{ base: "0", md: "4" }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        />
        <Button variant="ghost" onClick={toggleColorMode}>
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              className="group"
              py={2}
              transition="all 0.3s ease-in-out"
              rounded="lg"
              _focus={{ boxShadow: "none" }}
              _hover={{ bg: "cyan.600" }}
            >
              <HStack>
                <Avatar
                  ml={[0, 2]}
                  size={"sm"}
                  src={workspaceMemberProfile?.avatarUrl}
                />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{workspaceMemberProfile?.name}</Text>
                  <Text
                    className="group-hover:text-white transition-colors"
                    fontSize="xs"
                    color="gray.500"
                    textTransform="capitalize"
                  >
                    {workspaceMemberProfile?.role}
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              borderColor={useColorModeValue("gray.200", "gray.700")}
              py={0}
              rounded="lg"
            >
              <MenuItem roundedTop="lg">Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Billing</MenuItem>
              <MenuDivider
                borderColor={useColorModeValue("gray.300", "gray.500")}
              />
              <MenuItem onClick={logout} roundedBottom="lg">
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
