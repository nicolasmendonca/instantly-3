import React from "react";
import { SidebarWithHeader } from "src/components/Sidebar";
import { Outlet } from "react-router-dom";

interface IWorkspaceIdLayoutProps {}

const WorkspaceIdLayout: React.FC<IWorkspaceIdLayoutProps> = () => {
  return (
    <SidebarWithHeader>
      <Outlet />
    </SidebarWithHeader>
  );
};

export default WorkspaceIdLayout;
