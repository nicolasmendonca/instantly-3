import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Center, Heading } from "@chakra-ui/react";
import React from "react";
import { Link as RRDLink } from "react-router-dom";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import TaskIdPage from "./workspaces/[workspaceId]/projects/[projectId]/tasks/[taskId]/+page";

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
        children: [
          {
            path: "tasks/:taskId",
            element: <TaskIdPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <Center height="100dvh" display="flex" flexDir="column" gap={6}>
        <Heading>Not found 😓</Heading>
        <div>
          <Button as={RRDLink} to="/workspaces" leftIcon={<ArrowBackIcon />}>
            Back to Safety
          </Button>
        </div>
      </Center>
    ),
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
