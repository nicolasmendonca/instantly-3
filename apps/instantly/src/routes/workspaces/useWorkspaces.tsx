import { User, Workspace } from "instantly-client";
import useSWR, { SWRResponse } from "swr";
import { useAuth } from "src/features/auth/AuthProvider";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseWorkspacesKey = {
  userId: User["id"];
  key: "workspaces";
};

export function useWorkspaces(): SWRResponse<
  Workspace[],
  any,
  () => UseWorkspacesKey
> {
  const { user } = useAuth();
  const instantlyClient = useInstantlyClient();
  return useSWR<Workspace[], any, () => UseWorkspacesKey>(
    () => ({ userId: user!.id, key: "workspaces" }),
    instantlyClient.getWorkspacesForUser
  );
}
