import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { NewWorkspacePage } from "./workspaces/new";
import { WorkspaceIdPage } from "./workspaces/[workspaceId]";

const WorkspacesLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => {
      return redirect("/workspaces/new");
    },
  },
  {
    path: "/workspaces",
    element: <WorkspacesLayout />,
    children: [
      {
        path: "new",
        element: <NewWorkspacePage />,
      },
      {
        path: ":workspaceId",
        element: <WorkspaceIdPage />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
