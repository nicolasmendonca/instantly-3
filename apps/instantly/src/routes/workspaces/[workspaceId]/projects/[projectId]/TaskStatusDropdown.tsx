import React from "react";
import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { TaskStatus } from "instantly-client";

interface ITaskStatusDropdownProps {
  onChange: (status: TaskStatus) => void;
  status: TaskStatus;
  statusOptions: TaskStatus[];
}

export const TaskStatusDropdown: React.FC<ITaskStatusDropdownProps> = ({
  status: currentStatus,
  statusOptions,
  onChange,
}) => {
  return (
    <Menu size="sm">
      <MenuButton as={Button} size="xs" rightIcon={<ChevronDownIcon />}>
        {currentStatus.label}
      </MenuButton>
      <MenuList>
        <MenuOptionGroup
          onChange={(newStatusId) => {
            const matchingStatus = statusOptions.find(
              (status) => status.id === newStatusId
            );
            if (!matchingStatus) throw new Error("No matching status found");
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
