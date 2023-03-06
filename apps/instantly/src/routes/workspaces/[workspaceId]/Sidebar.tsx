import React from "react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import { FiMenu, FiBell, FiChevronDown } from "react-icons/fi";
import { Workspace } from "instantly-client";
import { useWorkspaceTasks } from "./useWorkspaceTasks";
import { useAuth } from "../../../features/auth/AuthProvider";
import { useWorkspace } from "../../../features/workspaces/useWorkspace";
import { useParams } from "react-router-dom";
import { useWorkspaceMemberProfile } from "../../../features/profile/useWorkspaceMemberProfile";

export const SidebarWithHeader: React.FC<{
  children: React.ReactNode;
  workspaceId: Workspace["id"];
}> = ({ children, workspaceId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        workspaceId={workspaceId}
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
          <SidebarContent workspaceId={workspaceId} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

interface SidebarProps extends BoxProps {
  workspaceId: Workspace["id"];
}

const SidebarContent = ({ workspaceId, ...rest }: SidebarProps) => {
  const { data: workspace } = useWorkspace({ workspaceId });
  const { data: tasks } = useWorkspaceTasks({ workspaceId });
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
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          {workspace?.name}
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} />
      </Flex>
      <Box mx="8" my="4">
        <Button
          width="full"
          variant="ghost"
          height={[14, 12]}
          borderWidth={1}
          borderColor="gray.500"
          _hover={{ bg: "cyan.700" }}
        >
          Create Task
        </Button>
      </Box>
      {tasks?.map((task) => (
        <NavItem key={task.id}>{task.title}</NavItem>
      ))}
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  children: React.ReactNode;
}
const NavItem = ({ children, ...rest }: NavItemProps) => {
  return (
    <Link
      href="#"
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
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
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
              transition="all 0.3s"
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
                    color="gray.600"
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
