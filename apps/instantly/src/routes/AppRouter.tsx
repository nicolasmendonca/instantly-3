import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { NewWorkspacePage } from "./workspaces/new/+page";
import { WorkspaceIdPage } from "./workspaces/[workspaceId]/+page";

const router = createBrowserRouter([
  {
    path: "/",
    loader: () => {
      return redirect("/workspaces/new");
    },
  },
  {
    path: "/workspaces",
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
