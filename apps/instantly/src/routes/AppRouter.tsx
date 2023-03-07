import { Center, Heading } from "@chakra-ui/react";
import React from "react";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom";

const WorkspacesPage = React.lazy(() => import("./workspaces/+page"));
const NewWorkspacePage = React.lazy(() => import("./workspaces/new/+page"));
const WorkspaceIdPage = React.lazy(
  () => import("./workspaces/[workspaceId]/+page")
);
const WorkspaceIdLayout = React.lazy(
  () => import("./workspaces/[workspaceId]/+layout")
);
const ProjectIdPage = React.lazy(
  () => import("./workspaces/[workspaceId]/projects/[projectId]/+page")
);

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => {
      return redirect("/workspaces");
    },
  },
  {
    path: "/workspaces",
    element: <WorkspacesPage />,
  },
  {
    path: "/workspaces/new",
    element: <NewWorkspacePage />,
  },
  {
    path: "/workspaces/:workspaceId",
    element: <WorkspaceIdLayout />,
    children: [
      {
        path: "",
        element: <WorkspaceIdPage />,
      },
      {
        path: "projects/:projectId",
        element: <ProjectIdPage />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <Center height="100dvh">
        <Heading>Not found 😓</Heading>
      </Center>
    ),
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
