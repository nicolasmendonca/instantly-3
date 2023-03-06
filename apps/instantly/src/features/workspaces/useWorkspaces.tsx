import useSWR from "swr";
import {
  instantlyClient,
  User,
  Workspace,
} from "../../clients/instantlyClient";
import { useAuth } from "../auth/AuthProvider";

export const useWorkspaces = () => {
  const { user } = useAuth();
  return useSWR<Workspace[], any, () => ["user", User["id"], "workspaces"]>(
    () => ["user", user!.id, "workspaces"],
    ([, userId]) => instantlyClient.getWorkspacesForUser({ userId })
  );
};
