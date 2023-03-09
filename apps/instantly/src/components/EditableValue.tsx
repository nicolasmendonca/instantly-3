import React from "react";
import {
  Editable,
  EditableProps,
  Flex,
  IconButton,
  useColorModeValue,
  useEditableControls,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

interface IEditableValueProps extends EditableProps {
  children: React.ReactNode;
}

export const EditableValue: React.FC<IEditableValueProps> = ({
  children,
  ...props
}) => {
  const textBgColor = useColorModeValue("blackAlpha.200", "blackAlpha.400");

  return (
    <Flex
      className="group transition-all"
      rounded="lg"
      p={2}
      _hover={{
        bgColor: textBgColor,
      }}
    >
      <Editable
        w="full"
        position="relative"
        transition="all .2s ease-in-out"
        {...props}
      >
        <Flex alignItems="start" justify="space-between">
          {children}
        </Flex>
      </Editable>
    </Flex>
  );
};

export const EditableButton: React.FC = () => {
  const { isEditing, getEditButtonProps } = useEditableControls();

  return isEditing ? null : (
    <IconButton
      aria-label="Edit"
      className="opacity-0 group-hover:opacity-100 transition-all"
      variant="ghost"
      size="sm"
      icon={<EditIcon />}
      {...getEditButtonProps()}
    />
  );
};
