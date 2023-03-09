import React from "react";
import { Link as ChakraLink, LinkProps } from "@chakra-ui/react";
import { Link as RRDLink } from "react-router-dom";

interface ILinkProps extends LinkProps {
  to: string;
}

export const Link: React.FC<ILinkProps> = (props) => {
  return <ChakraLink as={RRDLink} {...props} />;
};
