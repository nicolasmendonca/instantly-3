import React from "react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Avatar,
  Box,
  Flex,
  HStack,
  VStack,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
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
import { useParams } from "react-router-dom";
import { useAuth } from "src/features/auth/AuthProvider";
import { useWorkspace } from "src/features/workspaces/useWorkspace";
import { useWorkspaceMemberProfile } from "src/features/profile/useWorkspaceMemberProfile";
import { SidebarContent } from "./SidebarContent";

export const SidebarWithHeader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { workspaceId } = useParams<{ workspaceId: Workspace["id"] }>();
  const sidebarBg = useColorModeValue("gray.100", "gray.900");
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!workspaceId) return null;

  return (
    <Box minH="100vh" bg={sidebarBg}>
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
                  mr={[0, 2]}
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
