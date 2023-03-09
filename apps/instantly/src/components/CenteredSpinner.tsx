import React from "react";
import { Center, Spinner } from "@chakra-ui/react";

interface ICenteredSpinnerProps {
  height?: string;
}

export const CenteredSpinner: React.FC<ICenteredSpinnerProps> = ({
  height = "full",
}) => {
  return (
    <Center height={height}>
      <Spinner />
    </Center>
  );
};
