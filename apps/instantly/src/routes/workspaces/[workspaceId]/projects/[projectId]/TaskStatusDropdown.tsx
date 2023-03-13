import React from "react";
import {
  Button,
  ButtonProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  MenuProps,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { TaskStatus } from "instantly-core";

interface ITaskStatusDropdownProps {
  onChange: (status: TaskStatus) => void;
  status: TaskStatus;
  statusOptions: TaskStatus[];
  menuProps?: Omit<MenuProps, "children">;
  buttonProps?: Omit<ButtonProps, "children">;
}

export const TaskStatusDropdown: React.FC<ITaskStatusDropdownProps> = ({
  status: currentStatus,
  statusOptions,
  onChange,
  menuProps = {},
  buttonProps = {},
}) => {
  return (
    <Menu {...menuProps}>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...buttonProps}>
        {currentStatus.label}
      </MenuButton>
      <MenuList>
        <MenuOptionGroup
          onChange={(newStatusId) => {
            const matchingStatus = statusOptions.find(
              (status) => status.id === newStatusId
            )!;
            onChange(matchingStatus);
          }}
          value={currentStatus.id}
        >
          {statusOptions.map((status) => (
            <MenuItemOption value={status.id} key={status.id}>
              {status.label}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
        <MenuDivider />
        <MenuItemOption>Manage Statuses</MenuItemOption>
      </MenuList>
    </Menu>
  );
};
