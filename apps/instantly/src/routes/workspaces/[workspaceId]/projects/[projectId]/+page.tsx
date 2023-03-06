import React from "react";
import { Box } from "@chakra-ui/react";
import { useProject } from "src/features/projects/useProject";
import { useParams } from "react-router-dom";

interface IProjectIdPageProps {}

const ProjectIdPage: React.FC<IProjectIdPageProps> = () => {
  const params = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const { data } = useProject({
    workspaceId: params.workspaceId!,
    projectId: params.projectId!,
  });
  return (
    <Box>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
};

export default ProjectIdPage;
