import React from "react";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";

const WorkspacesPage = React.lazy(() => import("./workspaces/+page"));
const NewWorkspacePage = React.lazy(() => import("./workspaces/new/+page"));
const WorkspaceIdPage = React.lazy(
  () => import("./workspaces/[workspaceId]/+page")
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
    element: <WorkspaceIdPage />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
