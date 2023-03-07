import useSWR from "swr";
import { User, Workspace } from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import { useAuth } from "../auth/AuthProvider";

export const useWorkspaces = () => {
  const { user } = useAuth();
  const instantlyClient = useInstantlyClient();
  return useSWR<Workspace[], any, () => ["user", User["id"], "workspaces"]>(
    () => ["user", user!.id, "workspaces"],
    ([, userId]) => instantlyClient.getWorkspacesForUser({ userId })
  );
};
