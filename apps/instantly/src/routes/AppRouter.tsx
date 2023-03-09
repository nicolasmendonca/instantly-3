import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Center, Heading } from "@chakra-ui/react";
import React, { Suspense } from "react";
import { Link as RRDLink } from "react-router-dom";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { CenteredSpinner } from "src/components/CenteredSpinner";
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

const projectsNavbarHeight = "80px";
const centeredLayoutHeight = `calc(100dvh - ${projectsNavbarHeight})`;

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
        element: (
          <Suspense
            fallback={<CenteredSpinner height={centeredLayoutHeight} />}
          >
            <WorkspaceIdPage />
          </Suspense>
        ),
      },
      {
        path: "projects/:projectId",
        element: (
          <Suspense
            fallback={<CenteredSpinner height={centeredLayoutHeight} />}
          >
            <ProjectIdPage />
          </Suspense>
        ),
        children: [
          {
            path: "tasks/:taskId",
            element: (
              <Suspense
                fallback={<CenteredSpinner height={centeredLayoutHeight} />}
              >
                <TaskIdPage />
              </Suspense>
            ),
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
