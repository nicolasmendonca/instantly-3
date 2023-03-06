import React from "react";
import { Workspace } from "instantly-client";
import { useParams } from "react-router-dom";
import { SidebarWithHeader } from "./Sidebar";

interface IWorkspaceIdPageProps {}

export const WorkspaceIdPage: React.FC<IWorkspaceIdPageProps> = () => {
  const { workspaceId } = useParams<{ workspaceId: Workspace["id"] }>();

  if (!workspaceId) throw new Error("Workspace id is required");

  return (
    <div>
      <SidebarWithHeader workspaceId={workspaceId}>Hola</SidebarWithHeader>
    </div>
  );
};
